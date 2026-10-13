"""Integration: registration, capacity, waitlist promotion and cancellation (US-11..US-18)."""
import threading

import pytest

from tests.conftest import IS_POSTGRES


def test_confirm_until_full_then_waitlist(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, capacity=2)
    learners = [signup("learner")[1] for _ in range(4)]

    results = [client.post(f"/workshops/{w['id']}/register", headers=h).json() for h in learners]
    assert [r["status"] for r in results] == ["confirmed", "confirmed", "waitlisted", "waitlisted"]
    assert results[0]["registration"]["booking_ref"].startswith("KAL-")
    assert [r["waitlist_position"] for r in results[2:]] == [1, 2]

    detail = client.get(f"/workshops/{w['id']}").json()
    assert detail["seats_filled"] == 2 and detail["seats_left"] == 0
    assert detail["waitlist_count"] == 2 and detail["badge"] == "Full"


def test_cancel_promotes_first_in_line_and_renumbers(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, capacity=1)
    a_user, a = signup("learner")
    b_user, b = signup("learner")
    c_user, c = signup("learner")
    reg_a = client.post(f"/workshops/{w['id']}/register", headers=a).json()["registration"]
    client.post(f"/workshops/{w['id']}/register", headers=b)
    client.post(f"/workshops/{w['id']}/register", headers=c)

    res = client.post(f"/registrations/{reg_a['id']}/cancel", headers=a)
    assert res.status_code == 200
    assert res.json() == {"status": "seat reassigned", "registration_id": reg_a["id"], "promoted_learner_id": b_user["id"]}

    b_bookings = client.get("/registrations/me", headers=b).json()
    assert b_bookings[0]["kind"] == "registration" and b_bookings[0]["status"] == "confirmed"
    c_bookings = client.get("/registrations/me", headers=c).json()
    assert c_bookings[0]["kind"] == "waitlist" and c_bookings[0]["waitlist_position"] == 1

    detail = client.get(f"/workshops/{w['id']}").json()
    assert detail["seats_filled"] == 1 and detail["waitlist_count"] == 1


def test_cancel_without_waitlist_frees_seat(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, capacity=3)
    _, a = signup("learner")
    reg = client.post(f"/workshops/{w['id']}/register", headers=a).json()["registration"]
    res = client.post(f"/registrations/{reg['id']}/cancel", headers=a)
    assert res.json()["status"] == "seat freed" and res.json()["promoted_learner_id"] is None
    assert client.get(f"/workshops/{w['id']}").json()["seats_left"] == 3
    assert client.post(f"/registrations/{reg['id']}/cancel", headers=a).status_code == 400


def test_learner_cannot_cancel_someone_elses_booking(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host)
    _, a = signup("learner")
    _, b = signup("learner")
    reg = client.post(f"/workshops/{w['id']}/register", headers=a).json()["registration"]
    assert client.post(f"/registrations/{reg['id']}/cancel", headers=b).status_code == 404


def test_leave_waitlist(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, capacity=1)
    _, a = signup("learner")
    _, b = signup("learner")
    _, c = signup("learner")
    for h in (a, b, c):
        client.post(f"/workshops/{w['id']}/register", headers=h)
    assert client.delete(f"/workshops/{w['id']}/waitlist", headers=b).status_code == 204
    assert client.get("/registrations/me", headers=c).json()[0]["waitlist_position"] == 1
    assert client.delete(f"/workshops/{w['id']}/waitlist", headers=b).status_code == 404


def test_hosts_cannot_book_and_attendee_list_is_private(client, signup, make_workshop):
    _, host = signup("host")
    _, other_host = signup("host")
    w = make_workshop(host, capacity=1)
    assert client.post(f"/workshops/{w['id']}/register", headers=host).status_code == 403
    _, a = signup("learner", name="Arjun")
    _, b = signup("learner", name="Priya")
    client.post(f"/workshops/{w['id']}/register", headers=a)
    client.post(f"/workshops/{w['id']}/register", headers=b)
    att = client.get(f"/workshops/{w['id']}/attendees", headers=host).json()
    assert [x["name"] for x in att["confirmed"]] == ["Arjun"]
    assert [(x["name"], x["position"]) for x in att["waitlist"]] == [("Priya", 1)]
    assert client.get(f"/workshops/{w['id']}/attendees", headers=other_host).status_code == 403


def test_capacity_cannot_drop_below_booked_seats(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, capacity=3)
    for _ in range(2):
        client.post(f"/workshops/{w['id']}/register", headers=signup("learner")[1])
    assert client.patch(f"/workshops/{w['id']}", json={"capacity": 1}, headers=host).status_code == 400
    assert client.patch(f"/workshops/{w['id']}", json={"capacity": 2}, headers=host).status_code == 200


@pytest.mark.skipif(not IS_POSTGRES, reason="row-level locking is only meaningful on PostgreSQL")
def test_concurrent_bookings_never_oversell_last_seat(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, capacity=1)
    learners = [signup("learner")[1] for _ in range(8)]
    statuses = []

    def book(h):
        statuses.append(client.post(f"/workshops/{w['id']}/register", headers=h).json()["status"])

    threads = [threading.Thread(target=book, args=(h,)) for h in learners]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert statuses.count("confirmed") == 1
    assert statuses.count("waitlisted") == 7
    assert client.get(f"/workshops/{w['id']}").json()["seats_filled"] == 1

