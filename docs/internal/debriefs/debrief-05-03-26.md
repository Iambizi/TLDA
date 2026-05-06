# Group Date — v3 Builder Brief

## Context

Group Date is an organizer-first internal web tool for a singles events business. The organizer (Liela) uses it to onboard participants, manage events, facilitate matching, and track outcomes. It is not a participant-facing app for now — everything is operated by the organizer. The tool is used in-person and in-sync, not async. All changes below are based on feedback after 2 live events and 40+ participant interviews.

---

## 1. Onboarding / Intake Form

### Section Order — SWAP
Change the section order from:
- Basic Info → Ideal Partner → About You

To:
- Basic Info → About You → Ideal Partner

*(Ideal Partner moves to last)*

Also need percentages in venn diagram to be editable manually, not only via slider

---

### Mandatory Fields
- **Section 1 (Basic Info)** — ALL fields required
- **Section 2 (About You)** — ALL optional
- **Section 3 (Ideal Partner)** — Only venn diagram question required rest is optional.

---

### New Feature — Questionnaire Builder
Add a questionnaire management section in the organizer's back-end. Questions are still being tested and will evolve between events. The organizer needs to be able to build, edit, and save question sets rather than having them hardcoded. The 3-section structure (Basic Info / About You / Ideal Partner) is permanent and must always be preserved.

---

### New Feature — Draft Mode
The organizer can start a participant profile ahead of a live interview (e.g. for people she already knows) and return to complete it later. Profiles must have a clear draft/incomplete state, distinct from submitted/complete profiles.

---

### New Feature — Photo Upload
Add a photo upload field to the participant intake/onboarding form.

---

### Remove
Remove the interviews scheduling/management section entirely from onboarding.

---

## 2. Participant Profiles

- **Add photo upload** to participant profile page
- **Add organizer notes section** on profile page — for post-event observations, impressions, or comments added by the organizer
- **Add ability for organizer to edit participant info** after initial creation
- **Bug fix — Application status** changes are broken. Status needs to be more flexible and reliable. Review and fix the status update flow.

---

## 3. Matching

### Redesign — Replace current matching section
Remove the interview section from the matching area. Replace with a dedicated matching workflow.

**New capability — Preliminary matching**
Allow the organizer to do manual preliminary matching before an event — suggesting or pairing participants ahead of time based on profiles.

---

## 4. New Page — Matches

Create a standalone Matches section. This is a core feature — the organizer's primary success metric is whether matched participants actually pursue things after the event.

**Per match, capture:**
- Participant A and Participant B (linked profiles)
- Status dropdown: Connected / Exchanged Contacts / Went on a Date / In a Relationship / No Follow-Up
- Follow-up date field
- Notes field (organizer observations)

**Goal:** Over time, this section shows whether the events are producing real outcomes.

---

## 5. Events

- **Multi-event assignment** — A participant must be assignable to multiple events (currently blocked)
- **Edit event** — Organizer must be able to edit an event record, including adding meeting notes to it
- **Add photo section** to event record
- **Bug fix** — Review overall event flow for flexibility issues flagged in session

---

## 6. Dashboard

Improve dashboard with meaningful at-a-glance insights. Required metrics:

- Matches made per event
- Contacts exchanged per event
- Revenue vs. cost per event
- Global aggregated view across all events

---

## 7. New Section — Operations

Create a new Operations section to track the financial side of events.

**Per-event view:**
- Costs incurred (line items)
- Amounts collected from participants
- Net per event

**Global view:**
- Aggregated costs, revenue, and net across all events

---

## 8. In-App Documentation

Add lightweight documentation or guided tooltips explaining key flows to the organizer. She needs contextual guidance within the tool — not just a working UI. Priority flows to document: participant onboarding, event creation, matching workflow, operations tracking.

---

## Open Items (Needs Organizer Input Before Building)

| Item | Question |
|---|---|
| Questionnaire Builder | Organizer to confirm final v3 question list (amalgamation of event 1 + event 2, dropping low-value questions) |
| Dashboard | Confirm if any additional metrics are wanted beyond those listed above |
| Matches outcomes | Confirm status dropdown options are complete or if additional states are needed |

---

## What Is NOT Changing

- Stack: Next.js + TypeScript + Tailwind + (except for supabase, will eventually get back to this) + Vercel
- 3-section structure of the intake form (Basic Info / About You / Ideal Partner) — permanent
- The tool remains organizer-only (not participant-facing)
- No async/self-serve onboarding in this version — tool is used in-sync during live interviews