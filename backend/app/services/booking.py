"""Pure booking rules for Kalakriti.

Everything here is free of database and HTTP concerns so that the seat,
waitlist and rating rules can be unit-tested (and mutation-tested) in
isolation. The routers call these helpers inside their DB transactions.
"""
from datetime import datetime
from typing import Iterable, Optional

MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

MIN_RATING = 1
MAX_RATING = 5


def has_free_seat(capacity: int, seats_filled: int) -> bool:
    """A learner gets a confirmed seat only while seats_filled is below capacity (US-13)."""
    return seats_filled < capacity


def seats_left(capacity: int, seats_filled: int) -> int:
    """Seats still open, never negative (US-05)."""
    return max(capacity - seats_filled, 0)


def decide_registration_status(capacity: int, seats_filled: int) -> str:
    """Return 'confirmed' when a seat is free, otherwise 'waitlisted' (US-11, US-15)."""
    return "confirmed" if has_free_seat(capacity, seats_filled) else "waitlisted"


def next_waitlist_position(existing_positions: Iterable[int]) -> int:
    """Next learner joins at the back of the queue; an empty queue starts at 1."""
    return max(existing_positions, default=0) + 1


def renumber_positions(positions: Iterable[int]) -> list[int]:
    """Close the gaps left when someone leaves or is promoted: 2,3,5 -> 1,2,3."""
    return list(range(1, len(list(positions)) + 1))


def make_booking_ref(session_date: datetime, registration_id: int) -> str:
    """Human-friendly booking reference, e.g. KAL-24MAY-1023 (as on the confirmation screen)."""
    return f"KAL-{session_date.day:02d}{MONTHS[session_date.month - 1]}-{1000 + registration_id}"


def is_valid_rating(rating: int) -> bool:
    return MIN_RATING <= rating <= MAX_RATING


def average_rating(ratings: Iterable[int]) -> Optional[float]:
    """Mean rating rounded to one decimal, or None when there are no reviews (US-20)."""
    values = list(ratings)
    if not values:
        return None
    return round(sum(values) / len(values), 1)


def workshop_badge(capacity: int, seats_filled: int, starts_at: datetime, now: datetime) -> str:
    """Status label used on the Host Dashboard: Completed, Full or Upcoming."""
    if starts_at <= now:
        return "Completed"
    if not has_free_seat(capacity, seats_filled):
        return "Full"
    return "Upcoming"
