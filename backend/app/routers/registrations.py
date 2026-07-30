from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/registrations", tags=["Registrations"])


@router.post("/", response_model=schemas.RegistrationOut)
def register_for_workshop(reg: schemas.RegistrationCreate, db: Session = Depends(get_db)):
    workshop = db.query(models.Workshop).filter(models.Workshop.id == reg.workshop_id).first()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")

    learner = db.query(models.Learner).filter(models.Learner.id == reg.learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")

    status = "confirmed" if workshop.seats_filled < workshop.capacity else "waitlisted"

    new_reg = models.Registration(
        workshop_id=reg.workshop_id, learner_id=reg.learner_id, status=status
    )
    db.add(new_reg)

    if status == "confirmed":
        workshop.seats_filled += 1

    db.commit()
    db.refresh(new_reg)
    return new_reg
