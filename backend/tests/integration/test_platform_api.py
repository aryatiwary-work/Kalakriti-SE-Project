"""Integration: landing-page stats and recent reviews."""
from tests.conftest import move_to_past


def test_stats_count_live_platform_data(client, signup, make_workshop):
    assert client.get("/stats").json() == {"upcoming_workshops": 0, "hosts": 0, "cities": 0, "seats_booked": 0}
    _, host = signup("host")
    w = make_workshop(host, capacity=1)
    client.post(f"/workshops/{w['id']}/register", headers=signup("learner")[1])
    client.post(f"/workshops/{w['id']}/register", headers=signup("learner")[1])  # waitlisted, not a seat
    stats = client.get("/stats").json()
    assert stats == {"upcoming_workshops": 1, "hosts": 1, "cities": 1, "seats_booked": 1}


def test_recent_reviews_newest_first_with_workshop_title(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, title="Wheel Throwing", capacity=3)
    learners = [signup("learner", name=n)[1] for n in ("Asha", "Bala", "Chitra")]
    for h in learners:
        client.post(f"/workshops/{w['id']}/register", headers=h)
    move_to_past(w["id"])
    client.post(f"/workshops/{w['id']}/reviews/", json={"rating": 5, "comment": "First"}, headers=learners[0])
    client.post(f"/workshops/{w['id']}/reviews/", json={"rating": 3}, headers=learners[1])  # no comment: skipped
    client.post(f"/workshops/{w['id']}/reviews/", json={"rating": 4, "comment": "Second"}, headers=learners[2])

    recent = client.get("/reviews/recent").json()
    assert [r["comment"] for r in recent] == ["Second", "First"]
    assert recent[0]["learner_name"] == "Chitra" and recent[0]["workshop_title"] == "Wheel Throwing"
    assert len(client.get("/reviews/recent?limit=1").json()) == 1
    assert client.get("/reviews/recent?limit=0").status_code == 422
