from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    """A learner, a workshop host or a platform admin (distinguished by role)."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="learner")  # learner / host / admin
    bio = Column(Text, nullable=True)
    city = Column(String(80), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    workshops = relationship("Workshop", back_populates="host")
    registrations = relationship("Registration", back_populates="learner")


class Workshop(Base):
    __tablename__ = "workshops"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(60), nullable=False, index=True)
    city = Column(String(80), nullable=False, index=True)
    area = Column(String(80), nullable=True)
    date_time = Column(DateTime, nullable=False, index=True)
    duration_minutes = Column(Integer, default=60, nullable=False)
    skill_level = Column(String(30), default="Beginner", nullable=False)
    price = Column(Float, default=0.0, nullable=False)
    capacity = Column(Integer, nullable=False)
    seats_filled = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="active", nullable=False)  # active / cancelled
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    host = relationship("User", back_populates="workshops")

    registrations = relationship("Registration", back_populates="workshop")
    waitlist = relationship(
        "WaitlistEntry", back_populates="workshop", order_by="WaitlistEntry.position"
    )
    reviews = relationship("Review", back_populates="workshop")


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="confirmed", nullable=False)  # confirmed / cancelled
    booking_ref = Column(String(30), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    workshop = relationship("Workshop", back_populates="registrations")
    learner = relationship("User", back_populates="registrations")


class WaitlistEntry(Base):
    __tablename__ = "waitlist"
    __table_args__ = (UniqueConstraint("workshop_id", "learner_id", name="uq_waitlist_learner"),)

    id = Column(Integer, primary_key=True, index=True)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    position = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    workshop = relationship("Workshop", back_populates="waitlist")
    learner = relationship("User")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("workshop_id", "learner_id", name="uq_review_learner"),)

    id = Column(Integer, primary_key=True, index=True)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    workshop = relationship("Workshop", back_populates="reviews")
    learner = relationship("User")
