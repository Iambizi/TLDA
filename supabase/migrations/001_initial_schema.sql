-- ============================================================
-- LTDA — Singles Event Platform
-- Supabase SQL Migration: Initial Schema
-- Run this in the Supabase SQL Editor or via CLI
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ─── Custom Types (Enums) ────────────────────────────────────

create type application_status as enum (
  'applied',
  'under_review',
  'interview_requested',
  'interviewed',
  'approved',
  'waitlisted',
  'declined',
  'assigned_to_event',
  'attended',
  'archived'
);

create type event_status as enum (
  'draft',
  'open',
  'closed',
  'completed',
  'archived'
);

create type attendance_status as enum (
  'invited',
  'confirmed',
  'waitlisted',
  'attended',
  'no_show',
  'cancelled'
);

create type interview_outcome as enum (
  'pending',
  'completed',
  'no_show',
  'follow_up_needed'
);

create type interest_status as enum (
  'potential_match',
  'one_sided_interest',
  'mutual_interest',
  'no_match',
  'follow_up_needed',
  'introduced_off_platform'
);

create type readiness_for_love as enum (
  'yes',
  'not_sure',
  'no'
);

create type lifestyle_preference as enum (
  'want',
  'dont_want',
  'flexible'
);


-- ─── Table: participants ─────────────────────────────────────
-- NOTE: values_or_worldview is a sensitive organizer-only field.
-- It must never appear in participant-facing views or list columns.
-- It should not be rendered as a visible label in the admin UI.

create table participants (
  id                              uuid primary key default uuid_generate_v4(),
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),

  -- Basic Info
  full_name                       text not null,
  contact_info                    text not null,
  gender                          text,
  age                             integer,
  birthday                        date,
  work                            text,

  -- About Self (Section 3 of form)
  dream_city                      text,
  ask_out_preference              text,
  comfortable_with_man_asking_woman boolean,
  comfortable_with_alcohol_meetcute boolean,
  life_in_5_years                 text,
  last_thing_that_made_you_laugh  text,
  dream_date                      text,
  family_notes                    text,
  vice_or_red_flag                text,
  dealbreaker                     text,
  random_curiosities              text,
  referral_notes                  text,

  -- SENSITIVE — organizer-only, never expose in participant-facing views
  values_or_worldview             text,

  -- Partner Preferences: Priority Weights (Venn)
  -- Stored as JSON for flexibility — values must sum to 100
  -- Example: {"pedigree": 40, "looks": 30, "personality": 30}
  priority_weights                jsonb,

  -- Partner Preferences: Readiness
  ready_for_love                  readiness_for_love,
  grand_amour                     text,

  -- Partner Preferences: Age Range
  preferred_partner_age_min       integer,
  preferred_partner_age_max       integer,
  okay_with_some_deviation        boolean,

  -- Lifestyle Attribute Pairs
  -- Each pair: does participant have it? / do they want it in a partner?
  has_kids                        lifestyle_preference,
  partner_has_kids                lifestyle_preference,

  travels_world                   lifestyle_preference,
  partner_travels_world           lifestyle_preference,

  is_divorced                     lifestyle_preference,
  partner_is_divorced             lifestyle_preference,

  smokes_drug_friendly            lifestyle_preference,
  partner_smokes_drug_friendly    lifestyle_preference,

  has_tattoos                     lifestyle_preference,
  partner_has_tattoos             lifestyle_preference,

  fitness_level                   lifestyle_preference,
  partner_fitness                 lifestyle_preference,

  close_with_family               lifestyle_preference,
  partner_close_with_family       lifestyle_preference
);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger participants_updated_at
  before update on participants
  for each row execute function update_updated_at_column();


-- ─── Table: events ───────────────────────────────────────────

create table events (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  title       text not null,
  event_date  timestamptz,
  location    text,
  description text,
  status      event_status not null default 'draft',
  notes       text
);

create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at_column();


-- ─── Table: applications ─────────────────────────────────────

create table applications (
  id                    uuid primary key default uuid_generate_v4(),
  participant_id        uuid not null references participants(id) on delete cascade,
  submitted_at          timestamptz not null default now(),
  source_event_id       uuid references events(id) on delete set null,
  status                application_status not null default 'applied',
  organizer_notes       text,
  tags                  text[],
  interview_required    boolean not null default false,
  interview_completed   boolean not null default false,
  interview_date        timestamptz,
  assigned_event_id     uuid references events(id) on delete set null
);

-- Index for common queries
create index applications_participant_id_idx on applications(participant_id);
create index applications_status_idx on applications(status);
create index applications_assigned_event_id_idx on applications(assigned_event_id);


-- ─── Table: interviews ───────────────────────────────────────

create table interviews (
  id              uuid primary key default uuid_generate_v4(),
  participant_id  uuid not null references participants(id) on delete cascade,
  application_id  uuid not null references applications(id) on delete cascade,
  scheduled_at    timestamptz,
  completed_at    timestamptz,
  notes           text,
  outcome         interview_outcome not null default 'pending'
);

create index interviews_participant_id_idx on interviews(participant_id);
create index interviews_application_id_idx on interviews(application_id);


-- ─── Table: event_participants ───────────────────────────────
-- Join table between participants and events

create table event_participants (
  id                uuid primary key default uuid_generate_v4(),
  participant_id    uuid not null references participants(id) on delete cascade,
  event_id          uuid not null references events(id) on delete cascade,
  application_id    uuid references applications(id) on delete set null,
  attendance_status attendance_status not null default 'invited',
  organizer_notes   text,
  unique(participant_id, event_id)
);

create index event_participants_event_id_idx on event_participants(event_id);
create index event_participants_participant_id_idx on event_participants(participant_id);


-- ─── Table: match_outcomes ───────────────────────────────────
-- Organizer-recorded post-event interest signals. Not algorithmic.

create table match_outcomes (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  event_id          uuid not null references events(id) on delete cascade,
  participant_a_id  uuid not null references participants(id) on delete cascade,
  participant_b_id  uuid not null references participants(id) on delete cascade,
  interest_status   interest_status not null default 'potential_match',
  organizer_notes   text,
  -- Prevent duplicate pairs per event (in either direction)
  constraint unique_pair_per_event unique (event_id, participant_a_id, participant_b_id),
  constraint no_self_match check (participant_a_id != participant_b_id)
);

create trigger match_outcomes_updated_at
  before update on match_outcomes
  for each row execute function update_updated_at_column();

create index match_outcomes_event_id_idx on match_outcomes(event_id);
create index match_outcomes_participant_a_idx on match_outcomes(participant_a_id);
create index match_outcomes_participant_b_idx on match_outcomes(participant_b_id);


-- ─── Row Level Security ──────────────────────────────────────
-- Public: anyone can INSERT into participants + applications (the apply form)
-- All reads and other writes require authenticated organizer

alter table participants enable row level security;
alter table applications enable row level security;
alter table events enable row level security;
alter table event_participants enable row level security;
alter table interviews enable row level security;
alter table match_outcomes enable row level security;

-- participants: public INSERT (application form), organizer full access
create policy "public_can_insert_participants"
  on participants for insert
  to anon
  with check (true);

create policy "organizer_full_access_participants"
  on participants for all
  to authenticated
  using (true)
  with check (true);

-- applications: public INSERT, organizer full access
create policy "public_can_insert_applications"
  on applications for insert
  to anon
  with check (true);

create policy "organizer_full_access_applications"
  on applications for all
  to authenticated
  using (true)
  with check (true);

-- events: organizer only
create policy "organizer_full_access_events"
  on events for all
  to authenticated
  using (true)
  with check (true);

-- event_participants: organizer only
create policy "organizer_full_access_event_participants"
  on event_participants for all
  to authenticated
  using (true)
  with check (true);

-- interviews: organizer only
create policy "organizer_full_access_interviews"
  on interviews for all
  to authenticated
  using (true)
  with check (true);

-- match_outcomes: organizer only
create policy "organizer_full_access_match_outcomes"
  on match_outcomes for all
  to authenticated
  using (true)
  with check (true);
