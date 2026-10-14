from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import require_role
from ..serializers import now, workshop_out
from ..services import booking

router = APIRouter(prefix="/hosts", tags=["Hosts"])


@router.get("/", response_model=List[schemas.HostPublic])
def list_hosts(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == "host").order_by(models.User.name).all()


@router.get("/me/dashboard", response_model=schemas.HostDashboard)
def host_dashboard(
    db: Session = Depends(get_db),
    host: models.User = Depends(require_role("host")),
):
    """US-14 + US-22: summary tiles and per-workshop counts for the logged-in host."""
    at = now()
    workshops = (
        db.query(models.Workshop)
        .filter(models.Workshop.host_id == host.id)
        .order_by(models.Workshop.date_time)
        .all()
    )
    rows, all_ratings, total_regs = [], [], 0
    for w in workshops:
        confirmed = sum(1 for r in w.registrations if r.status == "confirmed")
        total_regs += confirmed
        all_ratings.extend(r.rating for r in w.reviews)
        rows.append(
            schemas.DashboardWorkshop(
                workshop=workshop_out(w, at), confirmed_count=confirmed, waitlist_count=len(w.waitlist)
            )
        )
    active = [w for w in workshops if w.status == "active"]
    return schemas.HostDashboard(
        host=host,
        total_registrations=total_regs,
        active_workshops=len(active),
        upcoming_sessions=sum(1 for w in active if w.date_time > at),
        host_rating=booking.average_rating(all_ratings),
        workshops=rows,
    )


@router.get("/{host_id}", response_model=schemas.HostPublic)
def get_host(host_id: int, db: Session = Depends(get_db)):
    host = db.get(models.User, host_id)
    if not host or host.role != "host":
        raise HTTPException(status_code=404, detail="Host not found")
    return host


@router.patch("/{host_id}/verify", response_model=schemas.HostPublic)
def verify_host(
    host_id: int,
    approve: bool = True,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role("admin")),
):
    """US-24: an admin approves (or revokes) a host's verified badge."""
    host = db.get(models.User, host_id)
    if not host or host.role != "host":
        raise HTTPException(status_code=404, detail="Host not found")
    host.is_verified = approve
    db.commit()
    db.refresh(host)
    return host
