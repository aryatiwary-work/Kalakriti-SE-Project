"""Registration, cancellation and waitlist logic (US-11 to US-18).

All seat and waitlist changes for a workshop happen inside one transaction
while the workshop row is locked (SELECT ... FOR UPDATE on PostgreSQL), so a
seat can never be double-booked and a freed seat is promoted atomically.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import require_role
from ..serializers import now, workshop_out
from ..services import booking

router = APIRouter(tags=["Registrations"])


def lock_workshop(db: Session, workshop_id: int) -> models.Workshop:
    workshop = (
        db.query(models.Workshop)
        .filter(models.Workshop.id == workshop_id)
        .with_for_update()
        .first()
    )
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop


def confirm_seat(db: Session, workshop: models.Workshop, learner_id: int) -> models.Registration:
    registration = models.Registration(
        workshop_id=workshop.id, learner_id=learner_id, status="confirmed"
    )
    db.add(registration)
    db.flush()  # assigns registration.id for the booking reference
    registration.booking_ref = booking.make_booking_ref(workshop.date_time, registration.id)
    workshop.seats_filled += 1
    return registration


def renumber_waitlist(db: Session, workshop_id: int) -> None:
    entries = (
        db.query(models.WaitlistEntry)
        .filter_by(workshop_id=workshop_id)
        .order_by(models.WaitlistEntry.position)
        .all()
    )
    for entry, position in zip(entries, booking.renumber_positions(e.position for e in entries)):
        entry.position = position


@router.post("/workshops/{workshop_id}/register", response_model=schemas.BookingResult)
def register_for_workshop(
    workshop_id: int,
    db: Session = Depends(get_db),
    learner: models.User = Depends(require_role("learner")),
):
    workshop = lock_workshop(db, workshop_id)
    if workshop.status != "active":
        raise HTTPException(status_code=400, detail="This workshop has been cancelled")
    if workshop.date_time <= now():
        raise HTTPException(status_code=400, detail="This workshop has already taken place")

    already_booked = (
        db.query(models.Registration)
        .filter_by(workshop_id=workshop_id, learner_id=learner.id, status="confirmed")
        .first()
    )
    if already_booked:
        raise HTTPException(status_code=409, detail="You already have a seat in this workshop")
    already_waiting = (
        db.query(models.WaitlistEntry).filter_by(workshop_id=workshop_id, learner_id=learner.id).first()
    )
    if already_waiting:
        raise HTTPException(status_code=409, detail="You are already on the waitlist for this workshop")

    status = booking.decide_registration_status(workshop.capacity, workshop.seats_filled)
    if status == "confirmed":
        registration = confirm_seat(db, workshop, learner.id)
        db.commit()
        db.refresh(registration)
        return {"status": "confirmed", "workshop_id": workshop_id, "registration": registration}

    positions = [
        p for (p,) in db.query(models.WaitlistEntry.position).filter_by(workshop_id=workshop_id)
    ]
    position = booking.next_waitlist_position(positions)
    db.add(models.WaitlistEntry(workshop_id=workshop_id, learner_id=learner.id, position=position))
    db.commit()
    return {"status": "waitlisted", "workshop_id": workshop_id, "waitlist_position": position}


@router.post("/registrations/{registration_id}/cancel", response_model=schemas.CancelResult)
def cancel_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    learner: models.User = Depends(require_role("learner")),
):
    """US-18 + US-12: cancelling frees the seat and promotes waitlist position 1 in the same transaction."""
    registration = db.get(models.Registration, registration_id)
    if not registration or registration.learner_id != learner.id:
        raise HTTPException(status_code=404, detail="Registration not found")
    if registration.status != "confirmed":
        raise HTTPException(status_code=400, detail="This registration is already cancelled")

    workshop = lock_workshop(db, registration.workshop_id)
    if workshop.date_time <= now():
        raise HTTPException(status_code=400, detail="This workshop has already taken place")
    registration.status = "cancelled"
    workshop.seats_filled = max(workshop.seats_filled - 1, 0)

    next_in_line = (
        db.query(models.WaitlistEntry)
        .filter_by(workshop_id=workshop.id)
        .order_by(models.WaitlistEntry.position)
        .first()
    )
    promoted_id = None
    if next_in_line and workshop.status == "active":
        promoted_id = next_in_line.learner_id
        confirm_seat(db, workshop, promoted_id)
        db.delete(next_in_line)
        db.flush()
        renumber_waitlist(db, workshop.id)

    db.commit()
    return {
        "status": "seat reassigned" if promoted_id else "seat freed",
        "registration_id": registration_id,
        "promoted_learner_id": promoted_id,
    }


@router.delete("/workshops/{workshop_id}/waitlist", status_code=204)
def leave_waitlist(
    workshop_id: int,
    db: Session = Depends(get_db),
    learner: models.User = Depends(require_role("learner")),
):
    lock_workshop(db, workshop_id)
    entry = db.query(models.WaitlistEntry).filter_by(workshop_id=workshop_id, learner_id=learner.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="You are not on the waitlist for this workshop")
    db.delete(entry)
    db.flush()
    renumber_waitlist(db, workshop_id)
    db.commit()


@router.get("/registrations/me", response_model=List[schemas.MyBooking])
def my_bookings(
    db: Session = Depends(get_db),
    learner: models.User = Depends(require_role("learner")),
):
    """My Bookings screen: confirmed/cancelled registrations plus waitlist places."""
    items = []
    registrations = (
        db.query(models.Registration)
        .filter_by(learner_id=learner.id)
        .order_by(models.Registration.created_at.desc())
        .all()
    )
    for reg in registrations:
        items.append(
            schemas.MyBooking(
                kind="registration",
                status=reg.status,
                registration_id=reg.id,
                booking_ref=reg.booking_ref,
                workshop=workshop_out(reg.workshop),
            )
        )
    for entry in db.query(models.WaitlistEntry).filter_by(learner_id=learner.id).all():
        items.append(
            schemas.MyBooking(
                kind="waitlist",
                status="waitlisted",
                waitlist_position=entry.position,
                workshop=workshop_out(entry.workshop),
            )
        )
    # upcoming sessions first (soonest at the top), then past ones
    at = now()
    items.sort(key=lambda b: (b.workshop.date_time <= at, abs((b.workshop.date_time - at).total_seconds())))
    return items


@router.get("/workshops/{workshop_id}/attendees", response_model=schemas.AttendeeList)
def workshop_attendees(
    workshop_id: int,
    db: Session = Depends(get_db),
    host: models.User = Depends(require_role("host")),
):
    """US-17: live list of confirmed attendees and the waitlist, for the owning host."""
    workshop = db.get(models.Workshop, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    if workshop.host_id != host.id:
        raise HTTPException(status_code=403, detail="You can only manage your own workshops")
    confirmed = [
        schemas.Attendee(
            learner_id=r.learner_id, name=r.learner.name, email=r.learner.email, booking_ref=r.booking_ref
        )
        for r in workshop.registrations
        if r.status == "confirmed"
    ]
    waitlist = [
        schemas.WaitlistedLearner(learner_id=e.learner_id, name=e.learner.name, position=e.position)
        for e in workshop.waitlist
    ]
    return {"workshop_id": workshop_id, "confirmed": confirmed, "waitlist": waitlist}
