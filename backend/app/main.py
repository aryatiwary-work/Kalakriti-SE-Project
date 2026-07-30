from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import workshops, hosts, registrations

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kalakriti API",
    description="Discover local workshops & skill sessions near you.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workshops.router)
app.include_router(hosts.router)
app.include_router(registrations.router)


@app.get("/")
def root():
    return {"message": "Welcome to the Kalakriti API. Visit /docs for API documentation."}


@app.get("/health")
def health_check():
    return {"status": "ok"}
