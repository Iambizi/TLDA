# Singles Event Onboarding & Match Coordination Platform

> [!NOTE] Quick primer for Liela
> We'll dive into everything below the line tomorrow, but I wanted to send over a draft of the PRD ahead of time so you can quickly scan what I currently understand about the product, what the first version likely includes, and what I think we'll need to clarify together.
>
> The idea here is not to over-specify anything too early, but to make sure we have a shared starting point before the meeting. This doc will become the product-level doc I use to shape the more technical implementation brief for an AI to build.
>
> - **Sections 1-5** -> alignment and framing
> - **Section 6** -> concrete product discussion
> - **Section 7** -> ambiguity and open questions

---

## 1. Product Summary

This product is intended to support a real-world singles events business that already exists today.

The first version should not be framed as a full dating app. It should be framed as an onboarding and event workflow system that helps the organizer collect participant information, manage onboarding, support match coordination, and prepare recurring events more efficiently.

In practice, the first version likely leans more toward an **organizer-first tool with participant intake**, rather than a fully developed two-sided product from day one.

Over time, it may evolve into a broader recurring-events or dating product.

---

## 2. Background / Current Workflow

The organizer already runs in-person singles events. The product should support an existing workflow, not invent one from scratch.

| Context | Detail |
| --- | --- |
| Event #1 | October 2025 |
| Event #2 | May 2026 |
| Post-event feedback | Collected after Event #1 |
| Current onboarding | Manual video calls |
| Info collected | Preferences, intentions, dealbreakers, matchmaking context |
| Mockups | Exist - primarily directional for v2 |

---

## 3. Problem

The current process is too manual and will become harder to manage as events continue and participation grows.

- Onboarding takes too much manual effort
- Participant information is not centralized
- Reviewing and tracking participants is inefficient
- Interview status, notes, attendance, and match context are harder to manage than they should be
- There is not yet a clear system for structuring interactions between matches (post-event: tracking potential interest and matches between guests)

---

## 4. Goals + Non-Goals

### Goals

- Streamline onboarding
- Centralize participant data
- Help the organizer review and manage submissions
- Track participant status across onboarding and event participation
- Support event preparation and match coordination
- Reduce operational friction as events become recurring

### Non-Goals for MVP

- Full dating app
- Advanced automated matching
- Feature-heavy messaging platform
- Polished native mobile app
- Subscription platform from day one
- Copying all features or flows from 222 simply because they exist in the reference product

---

## 5. Users

### Participant

A person applying to attend a curated in-person singles event.

**Needs:**

- A clear application flow
- A way to share profile, preferences, intentions, and dealbreakers
- Clarity on next steps (interview post-event, how to get in contact with whoever they liked)

### Organizer

The person managing onboarding, participant review, event preparation, and match coordination.

**Needs:**

- Structured intake
- Participant review and filtering
- Status tracking
- Notes, tags, and event coordination support

---

## 6. MVP Scope + Core Flows

### Participant

- Apply / sign up
- Complete onboarding questionnaire (multi-step, 3 sections)
- Submit profile information
- Share preferences, intentions, and dealbreakers
- Possibly indicate event availability
- Receive confirmation / next steps
- Potentially receive follow-up communication related to event participation or match coordination

### Organizer

- View submissions
- Review participant profiles
- Add notes and tags
- Update participant status
- Track interviews
- Track attendance / event assignment
- Filter and organize participants
- Support shortlist or pairing decisions
- Track match-related notes, pairings, or interaction outcomes

### Core Flows

#### Participant Onboarding

1. Participant applies
2. Participant completes onboarding
3. Organizer reviews submission
4. Organizer updates status
5. Participant receives next-step communication

#### Organizer Review

1. Organizer views submissions
2. Organizer reviews a participant
3. Organizer adds notes, tags, and status
4. Organizer decides whether to approve, interview, waitlist, or decline
5. Organizer assigns the participant to an event pool or shortlist

#### Event Preparation

1. Organizer reviews approved participants
2. Organizer filters and groups participants
3. Organizer prepares event assignments or match structure
4. Organizer updates post-event outcomes as needed

#### Match Interaction

> [!IMPORTANT] Biggest area to clarify
> The first version may support internal match coordination and interaction tracking without requiring a full participant messaging system. For v1, the organizer will rely on intuition and post-event interviews to match people - no algorithmic reliance.

---

## 7. Open Questions + Success Criteria

### Open Questions

> [!QUESTION] To resolve in meeting
>
> - Is the first version meant to reduce onboarding calls, replace them, or support them?
> - Is this primarily an internal organizer tool with participant intake, or a more fully two-sided product?
> - What exactly does "helping structure interaction between matches" mean in practice?
> - Do participants need accounts in the MVP?
> - Should the first version primarily be an internal admin dashboard with a participant intake flow, or something more participant-facing from day one?
> - Which parts of the 222-inspired experience feel essential from day one, and which parts are more aspirational?
> - What should the participant experience look like after acceptance and before the event?
> - What should happen after the event in cases where there is interest, no interest, or follow-up is needed?

### Success Criteria

The MVP is successful if it helps:

- [ ] Reduce manual onboarding effort
- [ ] Centralize participant information in one place
- [ ] Make participant review and filtering easier
- [ ] Improve tracking of onboarding, interview, and event status
- [ ] Make event preparation more efficient
- [ ] Provide a clearer internal process for match coordination
