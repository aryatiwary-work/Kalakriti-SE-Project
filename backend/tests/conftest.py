"""Shared fixtures.

By default the suite runs against a throwaway SQLite file so it is fast on
any laptop. Set TEST_DATABASE_URL to a PostgreSQL URL (as CI and the Docker
run do) to execute the very same tests against the production database engine.
"""
import os
from datetime import datetime, timedelta

os.environ["DATABASE_URL"] = os.getenv("TEST_DATABASE_URL", "sqlite:///./test_kalakriti.db")
os.environ.setdefault("SECRET_KEY", "test-secret")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import models  # noqa: E402
from app.database import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.security import hash_password  # noqa: E402

IS_POSTGRES = engine.dialect.name == "postgresql"


@pytest.fixture(autouse=True)
def fresh_database():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    yield
    models.Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def future(days: int = 7, hour: int = 10) -> str:
    return (datetime.now() + timedelta(days=days)).replace(hour=hour, minute=0, second=0, microsecond=0).isoformat()


@pytest.fixture
def signup(client):
    """Create an account through the public API and return (user, auth headers)."""
    counter = {"n": 0}

    def _signup(role: str = "learner", name: str | None = None):
        counter["n"] += 1
        n = counter["n"]
        res = client.post(
            "/auth/signup",
            json={
                "name": name or f"{role.title()} {n}",
                "email": f"{role}{n}@example.com",
                "password": "secret-pass-1",
                "role": role,
            },
        )
        assert res.status_code == 201, res.text
        body = res.json()
        return body["user"], {"Authorization": f"Bearer {body['access_token']}"}

    return _signup


@pytest.fixture
def admin_headers(client):
    db = SessionLocal()
    admin = models.User(
        name="Platform Admin", email="admin@kalakriti.in", password_hash=hash_password("admin-pass-1"), role="admin"
    )
    db.add(admin)
    db.commit()
    db.close()
    res = client.post("/auth/login", data={"username": "admin@kalakriti.in", "password": "admin-pass-1"})
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture
def make_workshop(client):
    def _make(host_headers, **overrides):
        payload = {
            "title": "Pottery Basics Workshop",
            "description": "Learn to centre clay on the wheel.",
            "category": "Pottery",
            "city": "Chennai",
            "area": "Alwarpet",
            "date_time": future(),
            "duration_minutes": 180,
            "skill_level": "Beginner",
            "price": 1200,
            "capacity": 2,
        }
        payload.update(overrides)
        res = client.post("/workshops/", json=payload, headers=host_headers)
        assert res.status_code == 201, res.text
        return res.json()

    return _make


def move_to_past(workshop_id: int, days: int = 1) -> None:
    """Simulate time passing: the session already happened (used for review tests)."""
    db = SessionLocal()
    w = db.get(models.Workshop, workshop_id)
    w.date_time = datetime.now() - timedelta(days=days)
    db.commit()
    db.close()
