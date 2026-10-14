from datetime import datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import require_role
from ..serializers import naive, now, workshop_out

router = APIRouter(prefix="/workshops", tags=["Workshops"])


def get_workshop_or_404(db: Session, workshop_id: int) -> models.Workshop:
    workshop = db.get(models.Workshop, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop


def get_owned_workshop(db: Session, workshop_id: int, host: models.User) -> models.Workshop:
    workshop = get_workshop_or_404(db, workshop_id)
    if workshop.host_id != host.id:
        raise HTTPException(status_code=403, detail="You can only manage your own workshops")
    return workshop


@router.post("/", response_model=schemas.WorkshopOut, status_code=201)
def create_workshop(
    data: schemas.WorkshopCreate,
    db: Session = Depends(get_db),
    host: models.User = Depends(require_role("host")),
):
    """US-07: a host lists a new workshop session."""
    payload = data.model_dump()
    payload["date_time"] = naive(payload["date_time"])
    if payload["date_time"] <= now():
        raise HTTPException(status_code=400, detail="Workshop date must be in the future")
    workshop = models.Workshop(**payload, host_id=host.id)
    db.add(workshop)
    db.commit()
    db.refresh(workshop)
    return workshop_out(workshop)


@router.get("/", response_model=List[schemas.WorkshopOut])
def list_workshops(
    city: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = Query(default=None, description="Search in title and description"),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    min_price: Optional[float] = Query(default=None, ge=0),
    max_price: Optional[float] = Query(default=None, ge=0),
    sort: Literal["date", "price_asc", "price_desc", "rating", "seats"] = "date",
    include_past: bool = False,
    db: Session = Depends(get_db),
):
    """US-01..US-05: location, category, date and price filters plus sorting."""
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=400, detail="min_price cannot be greater than max_price")
    if date_from and date_to and naive(date_from) > naive(date_to):
        raise HTTPException(status_code=400, detail="date_from cannot be after date_to")

    query = db.query(models.Workshop).filter(models.Workshop.status == "active")
    if not include_past:
        query = query.filter(models.Workshop.date_time > now())
    if city:
        query = query.filter(
            models.Workshop.city.ilike(f"%{city}%") | models.Workshop.area.ilike(f"%{city}%")
        )
    if category:
        query = query.filter(models.Workshop.category.ilike(f"%{category}%"))
    if q:
        query = query.filter(
            models.Workshop.title.ilike(f"%{q}%") | models.Workshop.description.ilike(f"%{q}%")
        )
    if date_from:
        query = query.filter(models.Workshop.date_time >= naive(date_from))
    if date_to:
        query = query.filter(models.Workshop.date_time <= naive(date_to))
    if min_price is not None:
        query = query.filter(models.Workshop.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Workshop.price <= max_price)

    results = [workshop_out(w) for w in query.order_by(models.Workshop.date_time).all()]
    if sort == "price_asc":
        results.sort(key=lambda w: w.price)
    elif sort == "price_desc":
        results.sort(key=lambda w: w.price, reverse=True)
    elif sort == "rating":
        results.sort(key=lambda w: (w.avg_rating or 0), reverse=True)
    elif sort == "seats":
        results.sort(key=lambda w: w.seats_left, reverse=True)
    return results


@router.get("/{workshop_id}", response_model=schemas.WorkshopOut)
def get_workshop(workshop_id: int, db: Session = Depends(get_db)):
    return workshop_out(get_workshop_or_404(db, workshop_id))


@router.patch("/{workshop_id}", response_model=schemas.WorkshopOut)
def update_workshop(
    workshop_id: int,
    data: schemas.WorkshopUpdate,
    db: Session = Depends(get_db),
    host: models.User = Depends(require_role("host")),
):
    """US-08: a host edits a listed session."""
    workshop = get_owned_workshop(db, workshop_id, host)
    changes = data.model_dump(exclude_unset=True)
    if "capacity" in changes and changes["capacity"] < workshop.seats_filled:
        raise HTTPException(
            status_code=400,
            detail=f"Capacity cannot be lower than the {workshop.seats_filled} seats already booked",
        )
    if "date_time" in changes:
        changes["date_time"] = naive(changes["date_time"])
        if changes["date_time"] <= now():
            raise HTTPException(status_code=400, detail="Workshop date must be in the future")
    for field, value in changes.items():
        setattr(workshop, field, value)
    db.commit()
    db.refresh(workshop)
    return workshop_out(workshop)


@router.post("/{workshop_id}/cancel", response_model=schemas.WorkshopOut)
def cancel_workshop(
    workshop_id: int,
    db: Session = Depends(get_db),
    host: models.User = Depends(require_role("host")),
):
    """US-08: a host cancels a session; every booking and waitlist entry is released."""
    workshop = get_owned_workshop(db, workshop_id, host)
    workshop.status = "cancelled"
    for reg in workshop.registrations:
        if reg.status == "confirmed":
            reg.status = "cancelled"
    for entry in list(workshop.waitlist):
        db.delete(entry)
    workshop.seats_filled = 0
    db.commit()
    db.refresh(workshop)
    return workshop_out(workshop)


@router.post("/{workshop_id}/duplicate", response_model=schemas.WorkshopOut, status_code=201)
def duplicate_workshop(
    workshop_id: int,
    data: schemas.WorkshopDuplicate,
    db: Session = Depends(get_db),
    host: models.User = Depends(require_role("host")),
):
    """US-09: copy a past listing to a new date."""
    original = get_owned_workshop(db, workshop_id, host)
    when = naive(data.date_time)
    if when <= now():
        raise HTTPException(status_code=400, detail="Workshop date must be in the future")
    copy = models.Workshop(
        title=original.title,
        description=original.description,
        category=original.category,
        city=original.city,
        area=original.area,
        date_time=when,
        duration_minutes=original.duration_minutes,
        skill_level=original.skill_level,
        price=original.price,
        capacity=original.capacity,
        host_id=host.id,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return workshop_out(copy)
