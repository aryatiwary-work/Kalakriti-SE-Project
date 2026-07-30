from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/hosts", tags=["Hosts"])


@router.post("/", response_model=schemas.HostOut)
def create_host(host: schemas.HostCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Host).filter(models.Host.email == host.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Host with this email already exists")
    new_host = models.Host(**host.model_dump())
    db.add(new_host)
    db.commit()
    db.refresh(new_host)
    return new_host


@router.get("/", response_model=List[schemas.HostOut])
def list_hosts(db: Session = Depends(get_db)):
    return db.query(models.Host).all()
