from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


class Host(Base):
    __tablename__ = "hosts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    bio = Column(Text, nullable=True)

    workshops = relationship("Workshop", back_populates="host")


class Workshop(Base):
    __tablename__ = "workshops"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(60), nullable=False)
    city = Column(String(80), nullable=False)
    area = Column(String(80), nullable=True)
    date_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    skill_level = Column(String(30), default="Beginner")
    price = Column(Float, default=0.0)
    capacity = Column(Integer, nullable=False)
    seats_filled = Column(Integer, default=0)

    host_id = Column(Integer, ForeignKey("hosts.id"))
    host = relationship("Host", back_populates="workshops")

    registrations = relationship("Registration", back_populates="workshop")


class Learner(Base):
    __tablename__ = "learners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False)

    registrations = relationship("Registration", back_populates="learner")


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    workshop_id = Column(Integer, ForeignKey("workshops.id"))
    learner_id = Column(Integer, ForeignKey("learners.id"))
    status = Column(String(20), default="confirmed")  # confirmed / waitlisted / cancelled

    workshop = relationship("Workshop", back_populates="registrations")
    learner = relationship("Learner", back_populates="registrations")
