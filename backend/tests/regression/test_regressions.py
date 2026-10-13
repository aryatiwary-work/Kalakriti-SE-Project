"""Regression suite.

Each test pins a defect that was present in the DA-2 skeleton code (commit
5ce6656 on main) and was fixed during Review 3 development. The suite runs on
every push in CI so none of these defects can silently come back. REG09 was
found later, during manual testing of the Review 3 build itself.
"""
from tests.conftest import future, move_to_past


def test_REG01_same_learner_cannot_book_twice(client, signup, make_workshop):
    """Old POST /registrations/ inserted a second confirmed row and double-counted seats_filled."""
    _, host = signup("host")
    w = make_workshop(host, capacity=5)
    _, learner = signup("learner")
    assert client.post(f"/workshops/{w['id']}/register", headers=learner).status_code == 200
    assert client.post(f"/workshops/{w['id']}/register", headers=learner).status_code == 409
    assert client.get(f"/workshops/{w['id']}").json()["seats_filled"] == 1


def test_REG02_capacity_and_price_are_validated(client, signup):
    """Old WorkshopCreate accepted capacity=0 and negative prices."""
    _, host = signup("host")
    base = {"title": "Yoga", "category": "Yoga", "city": "Chennai", "date_time": future()}
    assert client.post("/workshops/", json={**base, "capacity": 0}, headers=host).status_code == 422
    assert client.post("/workshops/", json={**base, "capacity": -3}, headers=host).status_code == 422
    assert client.post("/workshops/", json={**base, "capacity": 5, "price": -1}, headers=host).status_code == 422


def test_REG03_cancellation_promotes_the_waitlist(client, signup, make_workshop):
    """Old code had no cancel endpoint, so a freed seat was never offered to the waitlist (US-12)."""
    _, host = signup("host")
    w = make_workshop(host, capacity=1)
    _, a = signup("learner")
    waiting_user, b = signup("learner")
    reg = client.post(f"/workshops/{w['id']}/register", headers=a).json()["registration"]
    client.post(f"/workshops/{w['id']}/register", headers=b)
    res = client.post(f"/registrations/{reg['id']}/cancel", headers=a).json()
    assert res["promoted_learner_id"] == waiting_user["id"]
    assert client.get(f"/workshops/{w['id']}").json()["seats_filled"] == 1


def test_REG04_waitlisted_learner_does_not_consume_a_seat(client, signup, make_workshop):
    """Old code stored waitlisted learners in registrations; they must not count as seats."""
    _, host = signup("host")
    w = make_workshop(host, capacity=1)
    for _ in range(3):
        client.post(f"/workshops/{w['id']}/register", headers=signup("learner")[1])
    detail = client.get(f"/workshops/{w['id']}").json()
    assert detail["seats_filled"] == 1 and detail["waitlist_count"] == 2


def test_REG05_anyone_could_create_workshops_for_any_host(client, make_workshop):
    """Old POST /workshops/ trusted a host_id in the body with no authentication."""
    res = client.post("/workshops/", json={"title": "Fake", "category": "Art", "city": "Chennai",
                                           "date_time": future(), "capacity": 5, "host_id": 1})
    assert res.status_code == 401


def test_REG06_past_and_cancelled_workshops_are_not_listed(client, signup, make_workshop):
    """Old GET /workshops/ returned every row, including sessions that had already happened."""
    _, host = signup("host")
    keep = make_workshop(host, title="Upcoming")
    gone = make_workshop(host, title="To cancel")
    client.post(f"/workshops/{gone['id']}/cancel", headers=host)
    assert [w["title"] for w in client.get("/workshops/").json()] == [keep["title"]]


def test_REG07_cors_is_not_wildcard_with_credentials(client):
    """Old main.py combined allow_origins=['*'] with allow_credentials=True."""
    res = client.options(
        "/workshops/",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"},
    )
    assert res.headers.get("access-control-allow-origin") != "*"
    assert res.headers.get("access-control-allow-origin") != "https://evil.example"
    ok = client.options(
        "/workshops/",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"},
    )
    assert ok.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_REG08_email_login_is_case_insensitive(client):
    """Mixed-case signup emails could not log in with lower-case input."""
    client.post("/auth/signup", json={"name": "Priya", "email": "Priya@Travel.IN", "password": "12345678"})
    assert client.post("/auth/login", data={"username": "PRIYA@travel.in", "password": "12345678"}).status_code == 200


def test_REG09_past_bookings_cannot_be_cancelled(client, signup, make_workshop):
    """Found in manual testing: My Bookings let a learner cancel a session that had already run,
    which decremented seats_filled on a completed workshop."""
    _, host = signup("host")
    w = make_workshop(host)
    _, learner = signup("learner")
    reg = client.post(f"/workshops/{w['id']}/register", headers=learner).json()["registration"]
    move_to_past(w["id"])
    assert client.post(f"/registrations/{reg['id']}/cancel", headers=learner).status_code == 400
    assert client.get(f"/workshops/{w['id']}").json()["seats_filled"] == 1
