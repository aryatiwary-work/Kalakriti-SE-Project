import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth, hosts, platform, registrations, reviews, workshops

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kalakriti API",
    description="Discover local workshops & skill sessions near you.",
    version="0.3.0",
)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(workshops.router)
app.include_router(registrations.router)
app.include_router(reviews.router)
app.include_router(hosts.router)
app.include_router(platform.router)


@app.get("/")
def root():
    return {"message": "Welcome to the Kalakriti API. Visit /docs for API documentation."}


@app.get("/health")
def health_check():
    return {"status": "ok"}
