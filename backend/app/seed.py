"""Load demo data for local development and the Review 3 demo.

Usage (inside the backend container):  python -m app.seed
Creates one admin, three hosts, five learners and a set of workshops dated
relative to today, so the demo always shows upcoming sessions. Safe to run
more than once: it does nothing if users already exist.
"""
from datetime import datetime, timedelta

from . import models
from .database import Base, SessionLocal, engine
from .security import hash_password
from .services.booking import make_booking_ref

DEMO_PASSWORD = "kalakriti123"


def at(days: int, hour: int, minute: int = 0) -> datetime:
    return (datetime.now() + timedelta(days=days)).replace(hour=hour, minute=minute, second=0, microsecond=0)


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(models.User).count():
        print("Seed skipped: users already exist.")
        return

    def user(name, email, role, **extra):
        u = models.User(name=name, email=email, role=role, password_hash=hash_password(DEMO_PASSWORD), **extra)
        db.add(u)
        return u

    user("Platform Admin", "admin@kalakriti.in", "admin")
    clay = user("Clay Studio", "meera@claystudio.in", "host", city="Chennai", is_verified=True,
                bio="Meera's pottery studio in Alwarpet, teaching wheel and hand-building since 2016.")
    rhythm = user("Rhythm Dance Co", "hello@rhythmdance.in", "host", city="Chennai", is_verified=True,
                  bio="Contemporary and Bollywood dance classes for every level.")
    ink = user("Ink & Nib", "studio@inkandnib.in", "host", city="Chennai",
               bio="Calligraphy and lettering workshops.")
    arjun = user("Arjun Mehta", "arjun@example.com", "learner", city="Chennai")
    priya = user("Priya Nair", "priya@example.com", "learner", city="Bengaluru")
    ananya = user("Ananya Iyer", "ananya@example.com", "learner", city="Chennai")
    rahul = user("Rahul Verma", "rahul@example.com", "learner", city="Chennai")
    sneha = user("Sneha Reddy", "sneha@example.com", "learner", city="Chennai")
    db.flush()

    def workshop(host, **fields):
        w = models.Workshop(host_id=host.id, **fields)
        db.add(w)
        db.flush()
        return w

    pottery = workshop(clay, title="Pottery Basics Workshop", category="Pottery", city="Chennai", area="Alwarpet",
                       date_time=at(4, 10), duration_minutes=180, skill_level="Beginner", price=1200, capacity=12,
                       description="Learn the basics of pottery in this hands-on session. Centre clay on the wheel, "
                                   "pull your first walls and take home a glazed bowl. All materials provided.")
    wheel = workshop(clay, title="Wheel Throwing Masterclass", category="Pottery", city="Chennai", area="Alwarpet",
                     date_time=at(9, 16), duration_minutes=150, skill_level="Intermediate", price=1800, capacity=3,
                     description="Small-group class on trimming, handles and larger forms for learners who already centre clay.")
    workshop(clay, title="Raku Firing Evening", category="Pottery", city="Chennai", area="ECR",
             date_time=at(16, 17), duration_minutes=180, skill_level="All levels", price=2200, capacity=10,
             description="Watch and take part in a live raku firing by the beach.")
    workshop(rhythm, title="Contemporary Dance for Beginners", category="Dance", city="Chennai", area="Adyar",
             date_time=at(5, 18), duration_minutes=90, skill_level="Beginner", price=900, capacity=20,
             description="Warm-ups, floor work and a short routine. No experience needed.")
    workshop(rhythm, title="Bollywood Choreography Jam", category="Dance", city="Chennai", area="T. Nagar",
             date_time=at(12, 11), duration_minutes=120, skill_level="All levels", price=700, capacity=25,
             description="Learn a full Bollywood number in two hours.")
    calligraphy = workshop(ink, title="Modern Calligraphy Workshop", category="Calligraphy", city="Chennai",
                           area="Anna Nagar", date_time=at(6, 15), duration_minutes=120, skill_level="Beginner",
                           price=1000, capacity=15,
                           description="Brush pen and pointed-nib basics, with a take-home practice kit.")
    workshop(ink, title="Watercolour Painting Session", category="Painting", city="Chennai", area="Besant Nagar",
             date_time=at(7, 10), duration_minutes=180, skill_level="Beginner", price=1500, capacity=10,
             description="Loose botanical watercolours with a professional illustrator.")
    workshop(rhythm, title="Sunrise Yoga by the Beach", category="Yoga", city="Chennai", area="Besant Nagar",
             date_time=at(3, 6), duration_minutes=60, skill_level="All levels", price=300, capacity=30,
             description="Gentle vinyasa flow as the sun comes up.")
    workshop(ink, title="Guitar for Beginners", category="Music", city="Chennai", area="Velachery",
             date_time=at(8, 17), duration_minutes=120, skill_level="Beginner", price=1100, capacity=8,
             description="Chords, strumming patterns and your first song.")
    workshop(clay, title="South Indian Cooking Class", category="Cooking", city="Bengaluru", area="Indiranagar",
             date_time=at(10, 11), duration_minutes=180, skill_level="Beginner", price=1600, capacity=12,
             description="Dosa batter, sambar and three chutneys from scratch.")
    past = workshop(clay, title="Hand-building with Clay", category="Pottery", city="Chennai", area="Alwarpet",
                    date_time=at(-6, 10), duration_minutes=150, skill_level="Beginner", price=1000, capacity=10,
                    description="Pinch pots, coils and slabs.")

    def book(w, learner):
        r = models.Registration(workshop_id=w.id, learner_id=learner.id, status="confirmed")
        db.add(r)
        db.flush()
        r.booking_ref = make_booking_ref(w.date_time, r.id)
        w.seats_filled += 1
        return r

    for learner in (ananya, rahul, sneha):
        book(pottery, learner)
    for learner in (ananya, rahul, sneha):
        book(wheel, learner)
    db.add(models.WaitlistEntry(workshop_id=wheel.id, learner_id=priya.id, position=1))
    book(calligraphy, sneha)
    for learner, rating, comment in (
        (ananya, 5, "Great session! The instructor was patient and the studio is lovely."),
        (rahul, 5, "Loved it! Made my first bowl and can't wait to come back."),
        (sneha, 4, "Very well organised. Would love a longer session."),
    ):
        book(past, learner)
        db.add(models.Review(workshop_id=past.id, learner_id=learner.id, rating=rating, comment=comment))

    db.commit()
    db.close()
    print(f"Seeded demo data. Every demo account uses the password '{DEMO_PASSWORD}'.")


if __name__ == "__main__":
    run()
