# Kalakriti - Discover Local Workshops & Skill Sessions Near You

## Overview

Kalakriti (from *kala* - art/craft, and *kriti* - creation) is a location-based platform where anyone teaching a hands-on skill, pottery, painting, dance, music, yoga, cooking, calligraphy, woodworking, whatever it is, can list a workshop, and anyone looking to learn something new can discover what's happening near them, see the details upfront, and book a seat.

Right now, if you want to find out what workshops are running in your city this weekend, there's no single place to look. You end up piecing it together from Instagram stories, WhatsApp groups, word of mouth, or a random Google search that turns up one artisan's personal page with half the details missing. Kalakriti is meant to be the one place you check, pick your city or area, browse what's on, see how many seats are left, and register.

## Problem It Solves

* **For learners:** Finding a workshop today means scattered discovery, no way to compare what's happening nearby, on what date, at what price, with how many spots open. People miss out on sessions simply because they never heard about them in time.
* **For hosts (artisans, instructors, hobbyist teachers):** Most independent teachers don't have the time or technical skill to build a booking system. They manage registrations through DMs and phone calls, which breaks down fast once a session starts filling up, no waitlist, no easy way to close registration at capacity, no record of who's confirmed.
* **The actual gap:** There's no platform, in India or globally, that treats "local skill workshops" as its own category the way food delivery or event ticketing apps treat theirs. Kalakriti fills that specific gap.

## Target Users (Personas)

**1. Meera - the Workshop Host**

Runs weekend pottery sessions out of a small studio. Has a steady group of regulars but struggles to fill new slots or manage a waitlist when a session goes viral on social media. Wants a simple way to list a session, set a capacity, and stop worrying about overbooking.

**2. Arjun - the Curious Learner**

A working professional who wants to pick up a new hobby but has no idea what's available in his area. Doesn't want to follow ten different Instagram pages hoping to catch an announcement. Wants to search by location and category and just see what's on.

**3. Priya - the Occasional Traveler**

Visiting a new city for a few days and wants to try a local experience, a regional cooking class or a craft session, instead of doing the usual tourist things. Needs to filter by date and location quickly since her window is short.

**4. Admin/Platform Team (your own team, in this project's context)**

Needs to verify new hosts, handle disputes (no-shows, cancellations), and keep the category list and location data clean as the platform grows.

## Vision Statement

To become the default place anyone in India looks when they want to know: *"What can I learn near me this week?"*, making it as easy to discover and book a local workshop as it is to order food or book a movie ticket.

## Key Features / Goals

* **Location-based discovery:** Browse workshops by city/area, with filters for category (dance, pottery, music, yoga, cooking, painting, etc.), date, and price range.
* **Host onboarding:** Hosts create a profile and list sessions with details, description, duration, skill level, price, and capacity.
* **Capacity & waitlist management:** Once a session hits its seat limit, new registrants join a waitlist and are automatically offered a spot if someone cancels.
* **Registration & confirmation flow:** Learners register for a session and receive confirmation. Hosts see a live list of confirmed attendees.
* **Reviews & ratings:** After a session, attendees can rate and review, helping future learners choose confidently and helping good hosts stand out.
* **Host dashboard:** A simple view for hosts to manage upcoming sessions, see registration numbers, and communicate updates.

*(Later reviews will build on this, for example, smarter recommendations, host verification badges, or in-app messaging, but this is the core loop we're starting with.)*

## Success Metrics

* Number of workshops listed and successfully filled to capacity.
* Percentage of sessions that use the waitlist feature (signals real demand outpacing supply).
* Host retention, hosts who list more than one session after their first.
* Learner return rate, users who book a second workshop through the platform.
* Average time from search to registration (a proxy for how easy discovery actually is).

## Assumptions & Constraints

### Assumptions

* Hosts are willing to list session details upfront (date, capacity, price) rather than negotiating case by case.
* Learners are comfortable registering online and trust a platform enough to commit to a session in advance.
* Initial focus is on a single city/region for the MVP, with location filtering built to scale to more cities later.

### Constraints

* No in-app payment gateway for this phase, registration confirms a seat, but payment is handled outside the app (cash/UPI on arrival) to keep MVP scope realistic.
* No real-time chat between host and learner in this version, communication happens via basic contact details shared post-confirmation.
* Built and deployed as a two-person team project within a semester timeline, so infrastructure choices (single-region deployment, containerized local setup) are kept simple and cost-free rather than production-scale.
