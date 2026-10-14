"""Integration: workshop listing, discovery filters and host management."""
from tests.conftest import future


def test_only_hosts_can_create(client, signup, make_workshop):
    _, learner = signup("learner")
    _, host = signup("host", name="Clay Studio")
    res = client.post("/workshops/", json={"title": "x" * 5, "category": "Pottery", "city": "Chennai",
                                           "date_time": future(), "capacity": 5}, headers=learner)
    assert res.status_code == 403
    w = make_workshop(host)
    assert w["host_name"] == "Clay Studio"
    assert w["seats_left"] == 2 and w["badge"] == "Upcoming" and w["waitlist_count"] == 0


def test_validation_rules(client, signup):
    _, host = signup("host")
    base = {"title": "Dance", "category": "Dance", "city": "Chennai", "date_time": future(), "capacity": 10}
    assert client.post("/workshops/", json={**base, "capacity": 0}, headers=host).status_code == 422
    assert client.post("/workshops/", json={**base, "price": -50}, headers=host).status_code == 422
    assert client.post("/workshops/", json={**base, "date_time": future(days=-1)}, headers=host).status_code == 400


def test_filters_by_city_category_price_date_and_text(client, signup, make_workshop):
    _, host = signup("host")
    make_workshop(host, title="Pottery Basics", category="Pottery", city="Chennai", price=1200, date_time=future(3))
    make_workshop(host, title="Watercolour Evening", category="Painting", city="Chennai", price=1500, date_time=future(10))
    make_workshop(host, title="Salsa Night", category="Dance", city="Bengaluru", price=800, date_time=future(5))

    def titles(**params):
        return sorted(w["title"] for w in client.get("/workshops/", params=params).json())

    assert titles(city="chennai") == ["Pottery Basics", "Watercolour Evening"]
    assert titles(category="dance") == ["Salsa Night"]
    assert titles(min_price=1000, max_price=1300) == ["Pottery Basics"]
    assert titles(date_from=future(4), date_to=future(8)) == ["Salsa Night"]
    assert titles(q="water") == ["Watercolour Evening"]
    assert titles(city="chennai", category="pottery", max_price=2000) == ["Pottery Basics"]


def test_sorting(client, signup, make_workshop):
    _, host = signup("host")
    make_workshop(host, title="Mid", price=1000)
    make_workshop(host, title="Cheap", price=300)
    make_workshop(host, title="Pricey", price=2500)
    asc = [w["title"] for w in client.get("/workshops/", params={"sort": "price_asc"}).json()]
    desc = [w["title"] for w in client.get("/workshops/", params={"sort": "price_desc"}).json()]
    assert asc == ["Cheap", "Mid", "Pricey"]
    assert desc == ["Pricey", "Mid", "Cheap"]


def test_bad_ranges_rejected(client):
    assert client.get("/workshops/", params={"min_price": 900, "max_price": 100}).status_code == 400
    assert client.get("/workshops/", params={"date_from": future(9), "date_to": future(2)}).status_code == 400


def test_get_unknown_workshop_404(client):
    assert client.get("/workshops/999").status_code == 404


def test_edit_and_ownership(client, signup, make_workshop):
    _, host_a = signup("host")
    _, host_b = signup("host")
    w = make_workshop(host_a)
    res = client.patch(f"/workshops/{w['id']}", json={"price": 1500, "title": "Pottery Level 1"}, headers=host_a)
    assert res.status_code == 200 and res.json()["price"] == 1500 and res.json()["title"] == "Pottery Level 1"
    assert client.patch(f"/workshops/{w['id']}", json={"price": 1}, headers=host_b).status_code == 403
    assert client.patch(f"/workshops/{w['id']}", json={"date_time": future(-2)}, headers=host_a).status_code == 400


def test_cancel_workshop_hides_it_and_releases_bookings(client, signup, make_workshop):
    _, host = signup("host")
    _, learner = signup("learner")
    w = make_workshop(host)
    client.post(f"/workshops/{w['id']}/register", headers=learner)
    res = client.post(f"/workshops/{w['id']}/cancel", headers=host)
    assert res.json()["status"] == "cancelled" and res.json()["seats_filled"] == 0
    assert client.get("/workshops/").json() == []
    assert client.post(f"/workshops/{w['id']}/register", headers=learner).status_code == 400
    bookings = client.get("/registrations/me", headers=learner).json()
    assert bookings[0]["status"] == "cancelled"


def test_duplicate_listing(client, signup, make_workshop):
    _, host = signup("host")
    w = make_workshop(host, title="Calligraphy 101")
    res = client.post(f"/workshops/{w['id']}/duplicate", json={"date_time": future(21)}, headers=host)
    assert res.status_code == 201
    assert res.json()["title"] == "Calligraphy 101" and res.json()["id"] != w["id"]
    assert res.json()["seats_filled"] == 0
