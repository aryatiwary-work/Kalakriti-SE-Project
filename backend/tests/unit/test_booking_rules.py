"""Unit tests for the pure booking rules (also the target of mutation testing)."""
from datetime import datetime, timedelta

import pytest

from app.services import booking

NOW = datetime(2026, 10, 13, 12, 0)


@pytest.mark.parametrize(
    "capacity, filled, expected",
    [(10, 0, True), (10, 9, True), (10, 10, False), (10, 11, False), (1, 0, True), (1, 1, False)],
)
def test_has_free_seat_boundaries(capacity, filled, expected):
    assert booking.has_free_seat(capacity, filled) is expected


@pytest.mark.parametrize("capacity, filled, expected", [(12, 8, 4), (12, 12, 0), (12, 13, 0), (5, 0, 5)])
def test_seats_left_never_negative(capacity, filled, expected):
    assert booking.seats_left(capacity, filled) == expected


def test_decide_status_confirms_until_capacity_then_waitlists():
    assert booking.decide_registration_status(2, 0) == "confirmed"
    assert booking.decide_registration_status(2, 1) == "confirmed"
    assert booking.decide_registration_status(2, 2) == "waitlisted"


def test_next_waitlist_position():
    assert booking.next_waitlist_position([]) == 1
    assert booking.next_waitlist_position([1]) == 2
    assert booking.next_waitlist_position([1, 2, 3]) == 4
    assert booking.next_waitlist_position([3, 1]) == 4


def test_renumber_positions_closes_gaps():
    assert booking.renumber_positions([2, 3, 5]) == [1, 2, 3]
    assert booking.renumber_positions([]) == []
    assert booking.renumber_positions([7]) == [1]


def test_booking_ref_format():
    assert booking.make_booking_ref(datetime(2025, 5, 24, 10), 23) == "KAL-24MAY-1023"
    assert booking.make_booking_ref(datetime(2026, 1, 3, 10), 1) == "KAL-03JAN-1001"
    assert booking.make_booking_ref(datetime(2026, 12, 31, 10), 0) == "KAL-31DEC-1000"


@pytest.mark.parametrize("rating, valid", [(0, False), (1, True), (3, True), (5, True), (6, False), (-1, False)])
def test_rating_range(rating, valid):
    assert booking.is_valid_rating(rating) is valid


def test_average_rating():
    assert booking.average_rating([]) is None
    assert booking.average_rating([5]) == 5.0
    assert booking.average_rating([5, 4]) == 4.5
    assert booking.average_rating([5, 4, 4]) == 4.3
    assert booking.average_rating(iter([3, 4])) == 3.5


def test_workshop_badge():
    later = NOW + timedelta(days=1)
    assert booking.workshop_badge(10, 3, later, NOW) == "Upcoming"
    assert booking.workshop_badge(10, 10, later, NOW) == "Full"
    assert booking.workshop_badge(10, 3, NOW - timedelta(hours=1), NOW) == "Completed"
    assert booking.workshop_badge(10, 3, NOW, NOW) == "Completed"
    assert booking.workshop_badge(10, 10, NOW - timedelta(days=2), NOW) == "Completed"


@pytest.mark.parametrize(
    "month, code",
    list(enumerate(["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], start=1)),
)
def test_booking_ref_uses_correct_month_code(month, code):
    # Added after mutation testing showed month-name mutants surviving.
    assert booking.make_booking_ref(datetime(2026, month, 15, 9), 5) == f"KAL-15{code}-1005"
