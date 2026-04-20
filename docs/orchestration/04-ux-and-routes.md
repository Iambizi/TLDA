# UX and Routes

## Core Screens
**Public**: Participant Application Form (multi-step, 3 sections), Application Confirmation / Next Steps
**Organizer (authenticated)**: Login, Dashboard, Participants / Applications List, Participant Detail / Review Page, Events List, Event Detail / Event Prep, Match Coordination / Post-Event Tracking.

## Core Flows
**Flow 1 — Participant Intake**: Participant visits `/apply` -> Completes form -> Sees `/apply/success` -> Organizer sees submission.
**Flow 2 — Organizer Review**: Opens participant list -> Reviews detail -> Adds notes/tags -> Updates status -> Schedules interview -> Approves/declines.
**Flow 3 — Event Assignment**: Opens event -> Reviews approved participants -> Assigns -> Prepares roster.
**Flow 4 — Post-Event Tracking**: Opens completed event -> Records attendance -> Logs interest between participants.

## UI / UX Direction
The UI should feel warm, modern, premium, curated, and human. Not generic B2B SaaS, swipe dating app, or social feed. Optimize for admin experience, clarity, and simple CRUD workflows.

## Suggested Routes
**Public**:
- `/apply`
- `/apply/success`

**Organizer**:
- `/login`
- `/dashboard`
- `/participants`
- `/participants/[id]`
- `/events`
- `/events/[id]`
- `/events/[id]/matches`
