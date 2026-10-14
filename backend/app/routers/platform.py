"""Public, read-only figures for the landing page: live platform stats and recent reviews."""
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..serializers import now

router = APIRouter(tags=["Platform"])


@router.get("/stats", response_model=schemas.PlatformStats)
def platform_stats(db: Session = Depends(get_db)):
    upcoming = db.query(models.Workshop).filter(
        models.Workshop.status == "active", models.Workshop.date_time > now()
    )
    return schemas.PlatformStats(
        upcoming_workshops=upcoming.count(),
        hosts=db.query(models.User).filter_by(role="host").count(),
        cities=db.query(func.count(func.distinct(models.Workshop.city))).scalar() or 0,
        seats_booked=db.query(models.Registration).filter_by(status="confirmed").count(),
    )


@router.get("/reviews/recent", response_model=List[schemas.RecentReview])
def recent_reviews(limit: int = Query(6, ge=1, le=20), db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.comment.isnot(None), models.Review.comment != "")
        .order_by(models.Review.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        schemas.RecentReview(
            id=r.id,
            rating=r.rating,
            comment=r.comment,
            learner_name=r.learner.name,
            workshop_id=r.workshop_id,
            workshop_title=r.workshop.title,
            category=r.workshop.category,
        )
        for r in reviews
    ]
