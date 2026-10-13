from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Users & auth ----------

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal["learner", "host"] = "learner"
    bio: Optional[str] = None
    city: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    role: str
    bio: Optional[str] = None
    city: Optional[str] = None
    is_verified: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class HostPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    bio: Optional[str] = None
    city: Optional[str] = None
    is_verified: bool


# ---------- Workshops ----------

class WorkshopBase(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: Optional[str] = None
    category: str = Field(min_length=2, max_length=60)
    city: str = Field(min_length=2, max_length=80)
    area: Optional[str] = Field(default=None, max_length=80)
    date_time: datetime
    duration_minutes: int = Field(default=60, gt=0, le=24 * 60)
    skill_level: Literal["Beginner", "Intermediate", "Advanced", "All levels"] = "Beginner"
    price: float = Field(default=0.0, ge=0)
    capacity: int = Field(gt=0, le=500)


class WorkshopCreate(WorkshopBase):
    pass


class WorkshopUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=150)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, min_length=2, max_length=60)
    city: Optional[str] = Field(default=None, min_length=2, max_length=80)
    area: Optional[str] = None
    date_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(default=None, gt=0, le=24 * 60)
    skill_level: Optional[Literal["Beginner", "Intermediate", "Advanced", "All levels"]] = None
    price: Optional[float] = Field(default=None, ge=0)
    capacity: Optional[int] = Field(default=None, gt=0, le=500)


class WorkshopDuplicate(BaseModel):
    date_time: datetime


class WorkshopOut(WorkshopBase):
    id: int
    host_id: int
    host_name: str
    host_verified: bool
    seats_filled: int
    seats_left: int
    waitlist_count: int
    status: str
    badge: str
    avg_rating: Optional[float] = None
    review_count: int = 0


# ---------- Registrations & waitlist ----------

class RegistrationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    workshop_id: int
    learner_id: int
    status: str
    booking_ref: Optional[str] = None
    created_at: datetime


class BookingResult(BaseModel):
    status: Literal["confirmed", "waitlisted"]
    workshop_id: int
    registration: Optional[RegistrationOut] = None
    waitlist_position: Optional[int] = None


class CancelResult(BaseModel):
    status: Literal["seat freed", "seat reassigned"]
    registration_id: int
    promoted_learner_id: Optional[int] = None


class MyBooking(BaseModel):
    kind: Literal["registration", "waitlist"]
    status: str
    registration_id: Optional[int] = None
    booking_ref: Optional[str] = None
    waitlist_position: Optional[int] = None
    workshop: WorkshopOut


class Attendee(BaseModel):
    learner_id: int
    name: str
    email: EmailStr
    booking_ref: Optional[str] = None


class WaitlistedLearner(BaseModel):
    learner_id: int
    name: str
    position: int


class AttendeeList(BaseModel):
    workshop_id: int
    confirmed: List[Attendee]
    waitlist: List[WaitlistedLearner]


# ---------- Reviews ----------

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=1000)


class ReviewOut(BaseModel):
    id: int
    workshop_id: int
    learner_id: int
    learner_name: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime


# ---------- Host dashboard ----------

class DashboardWorkshop(BaseModel):
    workshop: WorkshopOut
    confirmed_count: int
    waitlist_count: int


class HostDashboard(BaseModel):
    host: UserOut
    total_registrations: int
    active_workshops: int
    upcoming_sessions: int
    host_rating: Optional[float] = None
    workshops: List[DashboardWorkshop]
