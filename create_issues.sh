#!/usr/bin/env bash
# Bulk-create Kalakriti's 25 user stories as GitHub Issues.
#
# PREREQUISITES (run these once, on your own machine, before this script):
#   1. Install GitHub CLI:      brew install gh   (or see https://cli.github.com)
#   2. Authenticate:            gh auth login
#   3. cd into your local clone of aryatiwary-work/Kalakriti-SE-Project
#
# USAGE:
#   chmod +x create_issues.sh
#   ./create_issues.sh
#
# This creates the labels used below (if missing) then opens all 25 issues.
# Edit REPO if your repo path differs.

set -e

REPO="devanshkalwani/Kalakriti-project-SE"

# --- Create labels (safe to re-run; ignores "already exists" errors) ---
create_label() {
  gh label create "$1" --repo "$REPO" --color "$2" --description "$3" 2>/dev/null || true
}
create_label "learner"  "1D76DB" "Arjun / learner persona"
create_label "host"     "0E8A16" "Meera / host persona"
create_label "traveler" "FBCA04" "Priya / traveler persona"
create_label "admin"    "5319E7" "Admin/platform persona"
create_label "discovery" "C5DEF5" "Location-based discovery epic"
create_label "onboarding" "C5DEF5" "Host onboarding epic"
create_label "waitlist" "C5DEF5" "Capacity & waitlist epic"
create_label "registration" "C5DEF5" "Registration & confirmation epic"
create_label "reviews" "C5DEF5" "Reviews & ratings epic"
create_label "dashboard" "C5DEF5" "Host dashboard epic"
create_label "admin-ops" "C5DEF5" "Admin/platform epic"

create_issue() {
  local title="$1"; local body="$2"; local labels="$3"
  gh issue create --repo "$REPO" --title "$title" --body "$body" --label "$labels"
}

# Epic 1: Location-Based Discovery
create_issue "US-01: Search workshops by city/area" \
"As Arjun (learner), I want to search workshops by city/area, so that I only see sessions I can realistically attend.

Acceptance Criteria:
- Search accepts city + optional area/pincode
- Results update without full page reload" "learner,discovery"

create_issue "US-02: Filter workshops by category" \
"As Arjun (learner), I want to filter workshops by category (pottery, dance, music, etc.), so that I can quickly find sessions matching my interests.

Acceptance Criteria:
- Multi-select category filter
- Filter combines with location filter" "learner,discovery"

create_issue "US-03: Filter workshops by date range" \
"As Priya (traveler), I want to filter workshops by date range, so that I can find sessions that fit my short visit window.

Acceptance Criteria:
- Date range picker with a 'this weekend' quick filter
- Sessions outside the range are excluded from results" "traveler,discovery"

create_issue "US-04: Filter workshops by price range" \
"As a learner, I want to filter by price range, so that I can find workshops within my budget.

Acceptance Criteria:
- Min/max price slider
- Free/donation-based sessions are clearly tagged" "learner,discovery"

create_issue "US-05: See remaining seats on listing card" \
"As a learner, I want to see a workshop's remaining seats on the listing card, so that I know urgency before opening details.

Acceptance Criteria:
- Seats-left count visible on card
- 'Waitlist only' badge shown when full" "learner,discovery"

# Epic 2: Host Onboarding & Session Listing
create_issue "US-06: Create host profile" \
"As Meera (host), I want to create a host profile with my bio and studio details, so that learners trust who they're booking with.

Acceptance Criteria:
- Profile fields: name, bio, location, photo
- Profile is publicly viewable on session pages" "host,onboarding"

create_issue "US-07: List a new workshop session" \
"As Meera (host), I want to list a new workshop with description, duration, skill level, price, and capacity, so that learners have all details upfront.

Acceptance Criteria:
- Form validates required fields before publish
- Capacity must be a positive integer" "host,onboarding"

create_issue "US-08: Edit or cancel a listed session" \
"As Meera (host), I want to edit or cancel a session I've listed, so that I can correct mistakes or handle emergencies.

Acceptance Criteria:
- Edits reflected immediately on public listing
- Cancelling a session notifies all confirmed registrants" "host,onboarding"

create_issue "US-09: Duplicate a past session listing" \
"As Meera (host), I want to duplicate a past session listing, so that I don't have to re-enter details for recurring sessions.

Acceptance Criteria:
- 'Duplicate' button pre-fills a new session form
- Date/capacity are reset and editable" "host,onboarding"

create_issue "US-10: Submit host profile for verification" \
"As a new host, I want to submit my profile for verification, so that learners see a verified badge and trust my listing.

Acceptance Criteria:
- Verification request goes to admin queue
- Host sees pending/approved/rejected status" "host,onboarding"

# Epic 3: Capacity & Waitlist Management
create_issue "US-11: Join waitlist when session is full" \
"As a learner, I want to join a waitlist when a session is full, so that I still have a chance to attend if a spot opens.

Acceptance Criteria:
- Waitlist join requires same info as registration
- Learner sees their waitlist position" "learner,waitlist"

create_issue "US-12: Auto-offer spot on cancellation" \
"As a learner on a waitlist, I want to be automatically offered a spot when someone cancels, so that I don't have to keep checking manually.

Acceptance Criteria:
- Notification sent to next person in waitlist order
- Offer expires after a fixed window (e.g. 12 hours), then passes to next" "learner,waitlist"

create_issue "US-13: Auto-close registration at capacity" \
"As Meera (host), I want the system to auto-close registration when capacity is reached, so that I don't get overbooked.

Acceptance Criteria:
- Registration button switches to 'Join waitlist' at capacity
- No confirmed registrant count can exceed capacity" "host,waitlist"

create_issue "US-14: View waitlist count on dashboard" \
"As Meera (host), I want to see how many people are on the waitlist for my session, so that I can judge demand for adding another slot.

Acceptance Criteria:
- Waitlist count visible on host dashboard
- Host can convert waitlist into a duplicated new session in one click" "host,waitlist,dashboard"

# Epic 4: Registration & Confirmation Flow
create_issue "US-15: Register for a session" \
"As a learner, I want to register for a session with my name and contact info, so that I can confirm my seat.

Acceptance Criteria:
- Minimal fields: name, phone/email
- Confirmation shown immediately after submission" "learner,registration"

create_issue "US-16: Receive registration confirmation" \
"As a learner, I want to receive a confirmation with session details after registering, so that I know I have a seat and where/when to show up.

Acceptance Criteria:
- Confirmation includes date, time, location, host contact
- Confirmation accessible again from 'My Registrations'" "learner,registration"

create_issue "US-17: View live list of confirmed attendees" \
"As Meera (host), I want to see a live list of confirmed attendees for each session, so that I know who to expect.

Acceptance Criteria:
- List updates in real time as registrations come in
- List is exportable/printable for day-of check-in" "host,registration"

create_issue "US-18: Cancel a registration" \
"As a learner, I want to cancel my registration if my plans change, so that my seat can be freed up for someone on the waitlist.

Acceptance Criteria:
- Cancel action available from 'My Registrations'
- Cancellation triggers waitlist offer (US-12)" "learner,registration"

# Epic 5: Reviews & Ratings
create_issue "US-19: Rate and review a session" \
"As a learner, I want to rate and review a session after attending, so that I can share my experience with future learners.

Acceptance Criteria:
- Review prompt appears only after session end date
- Rating is 1-5 stars with optional text" "learner,reviews"

create_issue "US-20: See host rating before registering" \
"As Arjun (learner), I want to see a host's average rating and past reviews before registering, so that I can decide confidently.

Acceptance Criteria:
- Average rating + review count shown on host profile and listing
- Reviews sorted by most recent" "learner,reviews"

create_issue "US-21: Host responds to a review" \
"As Meera (host), I want to respond publicly to a review, so that I can address feedback or thank a learner.

Acceptance Criteria:
- One host response per review
- Response displayed under the original review" "host,reviews"

# Epic 6: Host Dashboard
create_issue "US-22: Dashboard with upcoming sessions" \
"As Meera (host), I want a dashboard showing all my upcoming sessions with registration counts, so that I can manage everything from one place.

Acceptance Criteria:
- Dashboard lists sessions sorted by date
- Each row shows confirmed/capacity and waitlist count" "host,dashboard"

create_issue "US-23: Post update to registered attendees" \
"As Meera (host), I want to post an update/announcement to registered attendees of a session, so that I can communicate changes quickly.

Acceptance Criteria:
- Update field on session, visible to confirmed attendees only
- Timestamped update log per session" "host,dashboard"

# Epic 7: Admin / Platform Management
create_issue "US-24: Approve/reject host verification" \
"As an Admin, I want to review and approve/reject host verification requests, so that only genuine hosts get verified badges.

Acceptance Criteria:
- Admin queue lists pending requests with host details
- Approve/reject updates host status and notifies host" "admin,admin-ops"

create_issue "US-25: Manage categories and resolve disputes" \
"As an Admin, I want to manage the category list and resolve disputes (no-shows, cancellations), so that platform data stays clean as it scales.

Acceptance Criteria:
- Admin can add/edit/deactivate categories
- Admin can view a flagged-session queue for disputes" "admin,admin-ops"

echo "Done. 25 issues created in $REPO."
