from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class HostBase(BaseModel):
    name: str
    email: str
    bio: Optional[str] = None


class HostCreate(HostBase):
    pass


class HostOut(HostBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class WorkshopBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    city: str
    area: Optional[str] = None
    date_time: datetime
    duration_minutes: int = 60
    skill_level: str = "Beginner"
    price: float = 0.0
    capacity: int


class WorkshopCreate(WorkshopBase):
    host_id: int


class WorkshopOut(WorkshopBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    seats_filled: int
    host_id: int


class LearnerCreate(BaseModel):
    name: str
    email: str


class LearnerOut(LearnerCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class RegistrationCreate(BaseModel):
    workshop_id: int
    learner_id: int


class RegistrationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    workshop_id: int
    learner_id: int
    status: str
