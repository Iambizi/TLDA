# Data Model

## Core Entities

### A. Participant
Represents the person applying to attend events.

**Basic Info fields:**
- `id`, `full_name`, `contact_info`, `gender`, `age`, `birthday`, `work`, `created_at`, `updated_at`

**About Self fields** *(section 3 of onboarding form)*:
- `dream_city`, `ask_out_preference`, `comfortable_with_man_asking_woman` (boolean), `comfortable_with_alcohol_meetcute` (boolean), `life_in_5_years`, `last_thing_that_made_you_laugh`, `dream_date`, `family_notes`, `vice_or_red_flag`, `dealbreaker`, `random_curiosities`, `referral_notes`

**Sensitive field — handling note [CRITICAL]:**
- `values_or_worldview` — free text field replacing the original binary "pro-life / pro-choice" label. This field is organizer-only, should never appear in any participant-facing view or list column, and should not be rendered as a visible label in the admin UI.

### B. Partner Preferences
Can be stored on the participant record or as a related record. For MVP, storing on participant is acceptable.

**Priority Weights (Venn) [CRITICAL]**
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
- `ready_for_love` — enum: yes / not sure / no
- `grand_amour` — boolean or free text

**Preferred partner age range:**
- `preferred_partner_age_min` — integer
- `preferred_partner_age_max` — integer
- `okay_with_some_deviation` — boolean

**Lifestyle attribute preferences [CRITICAL]**
Each of the following 7 attributes captures two things:
1. Does the participant have this attribute themselves?
2. Do they want their partner to have it?

Store as paired columns per attribute:
- `has_kids` / `partner_has_kids`: want | don't want | flexible
- `travels_world` / `partner_travels_world`: want | don't want | flexible
- `is_divorced` / `partner_is_divorced`: want | don't want | flexible
- `smokes_drug_friendly` / `partner_smokes_drug_friendly`: want | don't want | flexible
- `has_tattoos` / `partner_has_tattoos`: want | don't want | flexible
- `fitness_level` / `partner_fitness`: want | don't want | flexible
- `close_with_family` / `partner_close_with_family`: want | don't want | flexible

This structure lets the organizer see both sides of compatibility for any two participants at a glance.

### C. Application
Tracks the actual intake and review process.
Fields: `id`, `participant_id`, `submitted_at`, `source_event_id` (nullable), `status`, `organizer_notes`, `tags`, `interview_required` (boolean), `interview_completed` (boolean), `interview_date` (nullable), `assigned_event_id` (nullable)

**Application status options:** applied → under_review → interview_requested → interviewed → approved → waitlisted → declined → assigned_to_event → attended → archived

### D. Event
Fields: `id`, `title`, `event_date`, `location`, `description`, `status`, `notes`, `created_at`, `updated_at`
**Event status options:** draft / open / closed / completed / archived

### E. Event Participation
Join table between participant and event.
Fields: `id`, `participant_id`, `event_id`, `application_id` (nullable), `attendance_status`, `organizer_notes`
**Attendance status options:** invited / confirmed / waitlisted / attended / no_show / cancelled

### F. Interview
Fields: `id`, `participant_id`, `application_id`, `scheduled_at` (nullable), `completed_at` (nullable), `notes`, `outcome`
**Outcome options:** pending / completed / no_show / follow_up_needed

### G. Match Outcome / Post-Event Interest
Tracks organizer-recorded match signals after an event. This is not an algorithmic system — it is a lightweight record of organizer judgment.
Fields: `id`, `event_id`, `participant_a_id`, `participant_b_id`, `interest_status`, `organizer_notes`, `created_at`, `updated_at`
**Interest status options:** potential_match / one_sided_interest / mutual_interest / no_match / follow_up_needed / introduced_off_platform
