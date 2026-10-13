"""Turn ORM objects into the public response schemas (the contract layer)."""
from datetime import datetime, timezone
from typing import Optional

from . import models, schemas
from .services import booking


def now() -> datetime:
    return datetime.now()


def naive(dt: datetime) -> datetime:
    """Store every timestamp as a naive local wall-clock time."""
    if dt.tzinfo is not None:
        return dt.astimezone().replace(tzinfo=None)
    return dt


def workshop_out(w: models.Workshop, at: Optional[datetime] = None) -> schemas.WorkshopOut:
    at = at or now()
    ratings = [r.rating for r in w.reviews]
    return schemas.WorkshopOut(
        id=w.id,
        title=w.title,
        description=w.description,
        category=w.category,
        city=w.city,
        area=w.area,
        date_time=w.date_time,
        duration_minutes=w.duration_minutes,
        skill_level=w.skill_level,
        price=w.price,
        capacity=w.capacity,
        host_id=w.host_id,
        host_name=w.host.name,
        host_verified=w.host.is_verified,
        seats_filled=w.seats_filled,
        seats_left=booking.seats_left(w.capacity, w.seats_filled),
        waitlist_count=len(w.waitlist),
        status=w.status,
        badge="Cancelled" if w.status == "cancelled"
        else booking.workshop_badge(w.capacity, w.seats_filled, w.date_time, at),
        avg_rating=booking.average_rating(ratings),
        review_count=len(ratings),
    )


def review_out(r: models.Review) -> schemas.ReviewOut:
    return schemas.ReviewOut(
        id=r.id,
        workshop_id=r.workshop_id,
        learner_id=r.learner_id,
        learner_name=r.learner.name,
        rating=r.rating,
        comment=r.comment,
        created_at=r.created_at,
    )
