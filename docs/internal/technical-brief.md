# Technical Implementation Brief
## Singles Event Onboarding & Match Coordination Platform — MVP v1

---

## 1. Overview

**Source document**
This technical brief is derived from `docs/internal/prd.md`. The PRD captures product intent, audience, goals, non-goals, and unresolved product questions. This brief converts those into implementation decisions, data structures, route scope, framework constraints, and verification requirements for an AI-assisted builder.

For future projects, keep this distinction explicit:
- the PRD should explain what the product is, who it serves, what it should not become, and which product questions remain unresolved
- the technical brief should resolve MVP implementation choices where possible, document assumptions, and define build/run/test guardrails
- implementation lessons from session logs should feed back into the technical brief when they reveal repeatable builder failure modes

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

---

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

**PRD ambiguity resolved for implementation**
The PRD intentionally left several questions open. For the MVP, this technical brief resolves them as follows:
- The first version supports and reduces manual onboarding work; it does not fully replace organizer judgment or interview calls.
- The product is an internal organizer tool with public participant intake, not a two-sided participant platform.
- Participants do not have accounts in v1.
- Post-acceptance and post-event communication can remain manual unless explicitly added later.
- "Match interaction" means organizer-only tracking of interest, notes, pairings, and outcomes; it does not mean participant messaging or algorithmic matching.
- 222-inspired or polished mockup flows are aspirational unless they directly support the organizer-first MVP.

---

## 3. Recommended Technical Stack

**Stack**
- Frontend: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- Backend / DB / Auth: Supabase
- Forms / validation: React Hook Form + Zod
- Hosting: Vercel
- Email: optional later via Resend or Supabase functions — can be stubbed/manual in v1

**Why this stack**
This stack is fast for AI-assisted implementation and well suited to admin dashboards, CRUD workflows, public forms, authenticated organizer-only areas, and relational data with simple dashboards.

It is also intentionally chosen for long-term continuity. Supabase is frontend-agnostic — the same database will serve future frontends, including a participant-facing web app or a React Native / native iOS app. The Next.js MVP is the first frontend, not the only one.

**Framework implementation guardrails**
- This project uses modern Next.js + React patterns that may differ from older builder defaults.
- The builder should check current framework docs before implementing patterns involving Server Actions, forms, routing, middleware / proxy behavior, and React action hooks.
- Prefer framework-native `action` / `formAction` patterns for Server Actions where possible.
- If `useActionState` is used in a custom client flow, the implementation must preserve React transition semantics correctly. Avoid patterns that dispatch actions outside the transition lifecycle.

**Next.js 16 bundler and dev-server policy**
- Next.js 16 uses Turbopack by default for `next dev`.
- This project has used Webpack for production builds via `next build --webpack`.
- If Turbopack produces unexplained runtime errors during development, it is acceptable to align local development with the build path by running `next dev --webpack`.
- Do not treat a dev-server startup banner as proof that the app is working. Always perform route smoke checks after startup.
- Next 16 writes development output under `.next/dev`; runtime logs may appear in `.next/dev/logs/next-development.log`.
- Next 16 uses a lockfile mechanism to prevent multiple `next dev` or `next build` instances for the same project. If a stale process holds the lock, identify and stop the stale process before restarting.

---

## 4. User Roles

**Organizer**
Primary user of the MVP. Can log in, view all applicants, review participant details, add notes, update statuses, track interviews, assign participants to events, record attendance, and log post-event interest / match outcomes.

**Participant**
Lightweight public-facing user in v1. Can fill out the application form (multi-step), submit onboarding information, and see the confirmation / next steps screen. Participants do not need accounts in v1.

---

## 5. Core Entities / Data Model

### A. Participant

Represents the person applying to attend events.

**Basic Info fields:**
- id
- full_name
- contact_info
- gender
- age
- birthday
- work
- created_at
- updated_at

**About Self fields** *(section 3 of onboarding form)*:
- dream_city
- ask_out_preference
- comfortable_with_man_asking_woman — boolean
- comfortable_with_alcohol_meetcute — boolean
- life_in_5_years
- last_thing_that_made_you_laugh
- dream_date
- family_notes
- vice_or_red_flag
- dealbreaker
- random_curiosities
- referral_notes

**Sensitive field — handling note:**
- values_or_worldview — free text field replacing the original binary "pro-life / pro-choice" label. This field is organizer-only, should never appear in any participant-facing view or list column, and should not be rendered as a visible label in the admin UI.

---

### B. Partner Preferences

Can be stored on the participant record or as a related record. For MVP, storing on participant is acceptable.

**Priority Weights (Venn)**

Store as a single JSON object, not three separate numeric columns. This keeps the field flexible if the organizer wants to rename or reweight categories later without a schema change.

```json
priority_weights: {
  "pedigree": 40,
  "looks": 30,
  "personality": 30
}
```

Values should sum to 100. In the UI, render as three sliders that auto-balance. The labels and number of categories should be configurable without requiring a schema migration.

**Readiness fields:**
- ready_for_love — enum: yes / not sure / no
- grand_amour — boolean or free text

**Preferred partner age range:**
- preferred_partner_age_min — integer
- preferred_partner_age_max — integer
- okay_with_some_deviation — boolean

**Lifestyle attribute preferences**

Each of the following 7 attributes captures two things:
1. Does the participant have this attribute themselves?
2. Do they want their partner to have it?

Store as paired columns per attribute:

```
has_kids            / partner_has_kids:           want | don't want | flexible
travels_world       / partner_travels_world:       want | don't want | flexible
is_divorced         / partner_is_divorced:         want | don't want | flexible
smokes_drug_friendly / partner_smokes_drug_friendly: want | don't want | flexible
has_tattoos         / partner_has_tattoos:         want | don't want | flexible
fitness_level       / partner_fitness:             want | don't want | flexible
close_with_family   / partner_close_with_family:   want | don't want | flexible
```

This structure lets the organizer see both sides of compatibility for any two participants at a glance.

---

### C. Application

Tracks the actual intake and review process.

Fields:
- id
- participant_id
- submitted_at
- source_event_id — nullable
- status
- organizer_notes
- tags
- interview_required — boolean
- interview_completed — boolean
- interview_date — nullable
- assigned_event_id — nullable

**Application status options:**
applied → under_review → interview_requested → interviewed → approved → waitlisted → declined → assigned_to_event → attended → archived

---

### D. Event

Fields:
- id
- title
- event_date
- location
- description
- status
- notes
- created_at
- updated_at

**Event status options:** draft / open / closed / completed / archived

---

### E. Event Participation

Join table between participant and event.

Fields:
- id
- participant_id
- event_id
- application_id — nullable
- attendance_status
- organizer_notes

**Attendance status options:** invited / confirmed / waitlisted / attended / no_show / cancelled

---

### F. Interview

Fields:
- id
- participant_id
- application_id
- scheduled_at — nullable
- completed_at — nullable
- notes
- outcome

**Outcome options:** pending / completed / no_show / follow_up_needed

---

### G. Match Outcome / Post-Event Interest

Tracks organizer-recorded match signals after an event. This is not an algorithmic system — it is a lightweight record of organizer judgment.

Fields:
- id
- event_id
- participant_a_id
- participant_b_id
- interest_status
- organizer_notes
- created_at
- updated_at

**Interest status options:** potential_match / one_sided_interest / mutual_interest / no_match / follow_up_needed / introduced_off_platform

---

## 6. Participant Application Form

The form is multi-step with three clearly labelled sections. Do not render as a single long page.

**Implementation requirements for the multi-step form**
- Advancing between steps must not submit the form implicitly.
- Final submission must only happen from an explicit submit action on the last step.
- Moving from one step to the next must preserve in-progress client state and must not remount or mutate controls in a way that can accidentally trigger submission.
- Validation should run section-by-section during progression, but final submission must still validate the full canonical schema before writing to the database.
- Public intake, organizer-created intake, and future CSV-imported intake should all conform to the same underlying validation rules.

**Section 1 — Basic Info**
Name, contact, gender, age, birthday, work.

**Section 2 — Ideal Partner**
Priority weights (venn sliders), readiness, lifestyle attribute pairs, preferred age range, okay with deviation.

**Section 3 — About You**
Dream city, ask-out preference, comfort with alcohol meetcute, life in 5 years, last thing that made you laugh, dream date, family notes, vice / red flag, dealbreaker, random curiosities, referral, worldview / values (free text — this field replaces the original binary label and should be presented neutrally).

---

## 7. Core Screens

**Public**
1. Participant Application Form (multi-step, 3 sections)
2. Application Confirmation / Next Steps

**Organizer (authenticated)**
3. Login
4. Dashboard — totals by status, upcoming events, recent submissions, pending reviews
5. Participants / Applications List — search, filter by status / event / tags, sort
6. Participant Detail / Review Page — full profile, organizer notes, status controls, interview tracking, event assignment
7. Events List
8. Event Detail / Event Prep — roster, attendance status, prep notes
9. Match Coordination / Post-Event Tracking — per-event, table/list view, organizer-only

---

## 8. Core Flows

**Flow 1 — Participant Intake**
1. Participant visits /apply
2. Completes three-section form
3. Submission creates participant record + application record
4. Participant sees /apply/success
5. Organizer sees new submission in dashboard

**Flow 2 — Organizer Review**
1. Organizer opens participant list
2. Reviews applicant detail
3. Adds notes and optional tags
4. Updates application status
5. Optionally schedules or completes interview
6. Approves, waitlists, declines, or keeps under review

**Flow 3 — Event Assignment**
1. Organizer creates or opens event
2. Reviews approved participants
3. Assigns participants to event
4. Updates event participation status
5. Prepares roster

**Flow 4 — Post-Event Tracking**
1. Organizer opens completed event
2. Records attendance outcomes
3. Logs observed interest between participants
4. Tracks: potential match / mutual interest / one-sided interest / no match / follow-up needed

This is organizer-discretion based, not algorithmic.

---

## 9. MVP Scope

**Must-have for v1**
- public multi-step application form
- participant data storage
- organizer auth / login
- organizer dashboard
- participant list and detail view
- application status tracking
- organizer notes
- interview tracking
- event creation and event assignment
- attendance tracking
- lightweight post-event match outcome tracking

**Nice-to-have if easy**
- calendar invite support for interviews
- automated organizer reminders
- basic email confirmation flow
- participant feedback questionnaire (organizer-triggered, sent post-event)
- organizer CSV import for legacy applicant/profile data, provided imported rows are normalized into the existing participant + application schema rather than introducing parallel storage

**Out of scope for v1**
- participant accounts
- participant profile editing
- participant browsing other participants
- participant messaging
- chat
- automated matching algorithm
- swipe mechanics
- social feed / community
- subscription / payments
- native mobile app

---

## 10. UI / UX Direction

The UI should feel warm, modern, premium, curated, and human.

It should not feel like generic cold B2B SaaS, a swipe-based dating app, or a social feed product.

**Practical direction:**
- participant side: minimal, clean, welcoming, lightweight
- organizer side: clear dashboard, table/list views, detail views, status controls
- prioritize clarity and usability over visual flourish
- admin experience should feel efficient and operationally useful
- organizer tables should avoid harsh spreadsheet-like gridlines; prefer softer row separators and readable density

**Admin safety requirements**
- High-risk destructive actions should live on contextual detail views, not be exposed casually in dense list/table views unless there is a strong operational reason.
- Destructive actions should require explicit confirmation.
- Any destructive action must define what happens to related records ahead of implementation. Do not leave cascade behavior ambiguous.

---

## 11. Suggested Routes

**Public**
- /apply
- /apply/success

**Organizer**
- /login
- /dashboard
- /participants
- /participants/import
- /participants/[id]
- /events
- /events/[id]
- /events/[id]/matches

---

## 12. Suggested Database Tables

- participants
- applications
- events
- event_participants
- interviews
- match_outcomes

Optional:
- tags + linking table if tags become more structured (for MVP, tags can be stored as an array column on applications)

---

## 13. Auth Model

- organizer-only auth
- single admin or small set of admins
- participants are public form submitters only — no participant login in v1

This must be explicit so the builder does not invent unnecessary auth complexity.

---

## 14. Communication Assumptions

For v1:
- participant confirmation can be on-screen only (/apply/success)
- organizer follow-up may remain manual
- email automation is optional, not required for MVP

If email is implemented, keep it simple: submission confirmation, interview invite, approval / next steps. Do not let email automation delay the MVP.

---

## 15. Schema Continuity and Validation Source of Truth

This schema is intentionally designed to support a future participant-facing layer — whether a web portal or a React Native / iOS app — without migration. The builder should avoid shortcuts that would compromise this:

- do not store participant data in flat JSON blobs
- do not conflate the participant and application records into one table
- do not conflate event_participants with the core participant record

The separation between participants, applications, events, event_participants, interviews, and match_outcomes is intentional and should be preserved.

The validation layer should follow the same continuity principle:
- define canonical validation rules once and reuse them across public intake, organizer workflows, and import flows
- do not create weaker parallel validation rules for CSV imports or admin-created records
- imported legacy data must bend to the existing schema, not expand the schema opportunistically to fit a spreadsheet

**Legacy data / import note**
- The organizer may already have manually managed participant profiles before using the system.
- If legacy import is implemented, it should create normal `participants` and `applications` records and should not use special-case storage.
- For MVP, importing applicant/profile data is acceptable; importing full historical workflow state (events, interviews, matches) is optional and should be treated as a separate scope decision.

---

## 16. Builder Instructions / Constraints

Build the MVP as an internal organizer-first web app.

Prioritize: speed, clarity, simple CRUD workflows, good data structure, clean admin UX.

Do not invent: participant accounts, social/discovery mechanics, messaging, matching algorithms, polished v2 consumer features from mockups.

Where ambiguity exists, default to the simpler internal-tool interpretation.

**Operational build guardrails**
- A feature is not done until it passes a production build, not just local dev mode.
- Treat TypeScript, schema validation, and deployment checks as part of the implementation, not cleanup work.
- Normalize joined / nullable backend data explicitly instead of relying on loose inference that may only fail in CI or Vercel.
- When using Supabase joins, be deliberate about optional and nullable data shapes in both UI and server logic.

**Local development and runtime verification runbook**
- Start the dev server with `npm run dev`.
- If Next reports that another dev server is already running for this repo, inspect the reported PID and log path before assuming the app is broken.
- If the server is unreachable or the browser shows an unexpected Turbopack runtime error, check `.next/dev/logs/next-development.log`.
- Stop stale `next dev` processes only after confirming they belong to this repo.
- Restart the dev server after clearing the stale process or changing bundler mode.
- Smoke-test the main route surface after startup:
  - `/`
  - `/login`
  - `/apply`
  - `/dashboard`
  - `/participants`
  - `/events`
  - one representative dynamic detail route when seeded/authenticated data exists
- A runtime check should verify both HTTP success and page rendering, because some framework errors only appear in the browser overlay or dev logs.
- If Turbopack-specific runtime errors recur, test the same routes with `next dev --webpack` before changing application code.
- Record any repeatable environment/runtime fix in `docs/internal/session-log.md` and promote recurring lessons into this technical brief.

---

## 17. Build Phases

**Phase 1**
- organizer auth
- public multi-step application form
- participant / application storage
- dashboard
- participant list and detail view
- status updates
- organizer notes

**Phase 2**
- interviews
- events
- event assignment
- attendance tracking

**Phase 3**
- post-event match outcome tracking
- lightweight follow-up support
- participant feedback questionnaire (organizer-triggered, sent after event)
- optional email enhancements

---

## 18. Definition of a Successful v1 Build

The build is successful if the organizer can:

- collect participant applications in one place
- review and filter applicants efficiently
- track onboarding / interview / event statuses
- prepare event rosters more easily
- record post-event interest and match outcomes
- run the real-world event workflow with less manual chaos
