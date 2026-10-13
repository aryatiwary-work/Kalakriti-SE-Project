"""Integration: reviews, host dashboard and admin verification."""
from tests.conftest import move_to_past


def test_review_rules(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, capacity=1)
    _, attendee = signup("learner", name="Ananya")
    _, outsider = signup("learner")
    client.post(f"/workshops/{w['id']}/register", headers=attendee)

    # cannot review before the session has happened
    assert client.post(f"/workshops/{w['id']}/reviews/", json={"rating": 5}, headers=attendee).status_code == 400
    move_to_past(w["id"])
    assert client.post(f"/workshops/{w['id']}/reviews/", json={"rating": 5}, headers=outsider).status_code == 403
    assert client.post(f"/workshops/{w['id']}/reviews/", json={"rating": 6}, headers=attendee).status_code == 422
    res = client.post(f"/workshops/{w['id']}/reviews/", json={"rating": 5, "comment": "Loved it"}, headers=attendee)
    assert res.status_code == 201 and res.json()["learner_name"] == "Ananya"
    assert client.post(f"/workshops/{w['id']}/reviews/", json={"rating": 4}, headers=attendee).status_code == 409

    reviews = client.get(f"/workshops/{w['id']}/reviews/").json()
    assert len(reviews) == 1
    detail = client.get(f"/workshops/{w['id']}").json()
    assert detail["avg_rating"] == 5.0 and detail["review_count"] == 1 and detail["badge"] == "Completed"


def test_host_dashboard_counts(client, signup, make_workshop):
    _, host = signup("host", name="Clay Studio")
    w1 = make_workshop(host, title="Pottery Basics", capacity=2)
    w2 = make_workshop(host, title="Wheel Throwing", capacity=1)
    make_workshop(signup("host")[1], title="Someone else's")
    for _ in range(2):
        client.post(f"/workshops/{w1['id']}/register", headers=signup("learner")[1])
    for _ in range(3):
        client.post(f"/workshops/{w2['id']}/register", headers=signup("learner")[1])

    dash = client.get("/hosts/me/dashboard", headers=host).json()
    assert dash["host"]["name"] == "Clay Studio"
    assert dash["total_registrations"] == 3
    assert dash["active_workshops"] == 2 and dash["upcoming_sessions"] == 2
    assert dash["host_rating"] is None
    rows = {r["workshop"]["title"]: r for r in dash["workshops"]}
    assert set(rows) == {"Pottery Basics", "Wheel Throwing"}
    assert rows["Wheel Throwing"]["waitlist_count"] == 2
    assert rows["Wheel Throwing"]["workshop"]["badge"] == "Full"


def test_dashboard_is_host_only(client, signup):
    _, learner = signup("learner")
    assert client.get("/hosts/me/dashboard", headers=learner).status_code == 403


def test_admin_verifies_host(client, signup, admin_headers, make_workshop):
    host_user, host = signup("host")
    _, learner = signup("learner")
    assert client.patch(f"/hosts/{host_user['id']}/verify", headers=learner).status_code == 403
    res = client.patch(f"/hosts/{host_user['id']}/verify", headers=admin_headers)
    assert res.status_code == 200 and res.json()["is_verified"] is True
    w = make_workshop(host)
    assert w["host_verified"] is True
    assert client.get("/hosts/").json()[0]["is_verified"] is True
    assert client.patch("/hosts/9999/verify", headers=admin_headers).status_code == 404
