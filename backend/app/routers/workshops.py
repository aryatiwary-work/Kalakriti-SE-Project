from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/workshops", tags=["Workshops"])


@router.post("/", response_model=schemas.WorkshopOut)
def create_workshop(workshop: schemas.WorkshopCreate, db: Session = Depends(get_db)):
    host = db.query(models.Host).filter(models.Host.id == workshop.host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    new_workshop = models.Workshop(**workshop.model_dump())
    db.add(new_workshop)
    db.commit()
    db.refresh(new_workshop)
    return new_workshop


@router.get("/", response_model=List[schemas.WorkshopOut])
def list_workshops(
    city: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Workshop)
    if city:
        query = query.filter(models.Workshop.city.ilike(f"%{city}%"))
    if category:
        query = query.filter(models.Workshop.category.ilike(f"%{category}%"))
    return query.order_by(models.Workshop.date_time).all()


@router.get("/{workshop_id}", response_model=schemas.WorkshopOut)
def get_workshop(workshop_id: int, db: Session = Depends(get_db)):
    workshop = db.query(models.Workshop).filter(models.Workshop.id == workshop_id).first()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop
