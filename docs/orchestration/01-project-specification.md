# Project Specification

## 1. Overview
This MVP is an organizer-first internal web tool for a real singles events business.
It is not a full dating app.
The purpose of v1 is to help the organizer:
- collect participant applications
- store and review participant information
- track onboarding and interview status
- prepare event rosters
- record attendance
- track post-event interest, notes, and lightweight match coordination

The participant experience in v1 is intentionally lightweight:
- public application form (multi-step, three sections)
- confirmation / next steps screen
- organizer-led follow-up outside the platform

This MVP should support the organizer's existing real-world workflow, not reinvent it.

## 2. Product Positioning for the Builder
**What this is**
An internal operations tool with a public intake form.

**What this is not**
- not a dating app
- not a participant social platform
- not a swipe product
- not a messaging product
- not a participant browsing/discovery experience
- not an automated matching system
- not the polished user-facing v2 app

**Important note about mockups**
Any existing polished mockups are primarily directional references for a later participant-facing version of the product. They should not be treated as literal MVP scope.

The builder should optimize for:
- internal usability
- speed of implementation
- clear data structure
- simple, operationally useful workflows

## 3. MVP Scope
**Must-have for v1**: public multi-step application form, participant data storage, organizer auth/login, organizer dashboard, participant list/detail view, application status tracking, organizer notes, interview tracking, event creation/assignment, attendance tracking, lightweight post-event match outcome tracking.
**Out of scope for v1**: participant accounts, profile editing, messaging, algorithms, swipe mechanics, social feed, payments, native app.

## 4. Definition of a Successful v1 Build
The organizer can collect applications, review applicants efficiently, track statuses, prepare rosters, record post-event interest, and run real-world workflows with less manual chaos.

## 5. Build Phases
**Phase 1**: organizer auth, public form, participant storage, dashboard, participant list/detail view, status updates, organizer notes.
**Phase 2**: interviews, events, event assignment, attendance tracking.
**Phase 3**: post-event match outcome tracking, lightweight follow-up support.

## 6. User Roles
**Organizer**
Primary user of the MVP. Can log in, view all applicants, review participant details, add notes, update statuses, track interviews, assign participants to events, record attendance, and log post-event interest / match outcomes.

**Participant**
Lightweight public-facing user in v1. Can fill out the application form (multi-step), submit onboarding information, and see the confirmation / next steps screen. Participants do not need accounts in v1.
