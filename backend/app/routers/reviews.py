from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import require_role
from ..serializers import now, review_out

router = APIRouter(prefix="/workshops/{workshop_id}/reviews", tags=["Reviews"])


@router.post("/", response_model=schemas.ReviewOut, status_code=201)
def add_review(
    workshop_id: int,
    data: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    learner: models.User = Depends(require_role("learner")),
):
    """US-19: only learners who held a confirmed seat can review, once per workshop, after it ran."""
    workshop = db.get(models.Workshop, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    if workshop.date_time > now():
        raise HTTPException(status_code=400, detail="You can review a workshop once it has taken place")
    attended = (
        db.query(models.Registration)
        .filter_by(workshop_id=workshop_id, learner_id=learner.id, status="confirmed")
        .first()
    )
    if not attended:
        raise HTTPException(status_code=403, detail="Only learners with a confirmed seat can review this workshop")
    if db.query(models.Review).filter_by(workshop_id=workshop_id, learner_id=learner.id).first():
        raise HTTPException(status_code=409, detail="You have already reviewed this workshop")
    review = models.Review(
        workshop_id=workshop_id, learner_id=learner.id, rating=data.rating, comment=data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review_out(review)


@router.get("/", response_model=List[schemas.ReviewOut])
def list_reviews(workshop_id: int, db: Session = Depends(get_db)):
    if not db.get(models.Workshop, workshop_id):
        raise HTTPException(status_code=404, detail="Workshop not found")
    reviews = (
        db.query(models.Review)
        .filter_by(workshop_id=workshop_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return [review_out(r) for r in reviews]
