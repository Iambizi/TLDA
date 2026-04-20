// ============================================================
// SHARED TYPES — Singles Event Platform
// Source of truth for all TypeScript types used across the app
// ============================================================

// ─────────────────────────────────────────
// Enums
// ─────────────────────────────────────────

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'interview_requested'
  | 'interviewed'
  | 'approved'
  | 'waitlisted'
  | 'declined'
  | 'assigned_to_event'
  | 'attended'
  | 'archived'

export type EventStatus = 'draft' | 'open' | 'closed' | 'completed' | 'archived'

export type AttendanceStatus =
  | 'invited'
  | 'confirmed'
  | 'waitlisted'
  | 'attended'
  | 'no_show'
  | 'cancelled'

export type InterviewOutcome =
  | 'pending'
  | 'completed'
  | 'no_show'
  | 'follow_up_needed'

export type InterestStatus =
  | 'potential_match'
  | 'one_sided_interest'
  | 'mutual_interest'
  | 'no_match'
  | 'follow_up_needed'
  | 'introduced_off_platform'

export type ReadinessForLove = 'yes' | 'not_sure' | 'no'

export type LifestylePreference = 'want' | 'dont_want' | 'flexible'

export type Gender = 'man' | 'woman' | 'non_binary' | 'prefer_not_to_say' | string

// ─────────────────────────────────────────
// Priority Weights (Venn)
// Stored as a single JSON object — configurable without schema changes
// ─────────────────────────────────────────

export interface PriorityWeights {
  pedigree: number
  looks: number
  personality: number
  [key: string]: number // allows future category additions
}

// ─────────────────────────────────────────
// Participant
// ─────────────────────────────────────────

export interface Participant {
  id: string
  created_at: string
  updated_at: string

  // Basic Info
  full_name: string
  contact_info: string
  gender: Gender
  age: number | null
  birthday: string | null // ISO date string
  work: string | null

  // About Self
  dream_city: string | null
  ask_out_preference: string | null
  comfortable_with_man_asking_woman: boolean | null
  comfortable_with_alcohol_meetcute: boolean | null
  life_in_5_years: string | null
  last_thing_that_made_you_laugh: string | null
  dream_date: string | null
  family_notes: string | null
  vice_or_red_flag: string | null
  dealbreaker: string | null
  random_curiosities: string | null
  referral_notes: string | null

  // SENSITIVE — organizer only, never render as visible label in UI
  values_or_worldview: string | null

  // Partner Preferences
  priority_weights: PriorityWeights | null
  ready_for_love: ReadinessForLove | null
  grand_amour: string | null
  preferred_partner_age_min: number | null
  preferred_partner_age_max: number | null
  okay_with_some_deviation: boolean | null

  // Lifestyle pairs — self
  has_kids: LifestylePreference | null
  travels_world: LifestylePreference | null
  is_divorced: LifestylePreference | null
  smokes_drug_friendly: LifestylePreference | null
  has_tattoos: LifestylePreference | null
  fitness_level: LifestylePreference | null
  close_with_family: LifestylePreference | null

  // Lifestyle pairs — partner preference
  partner_has_kids: LifestylePreference | null
  partner_travels_world: LifestylePreference | null
  partner_is_divorced: LifestylePreference | null
  partner_smokes_drug_friendly: LifestylePreference | null
  partner_has_tattoos: LifestylePreference | null
  partner_fitness: LifestylePreference | null
  partner_close_with_family: LifestylePreference | null
}

// ─────────────────────────────────────────
// Application
// ─────────────────────────────────────────

export interface Application {
  id: string
  participant_id: string
  submitted_at: string
  source_event_id: string | null
  status: ApplicationStatus
  organizer_notes: string | null
  tags: string[] | null
  interview_required: boolean
  interview_completed: boolean
  interview_date: string | null
  assigned_event_id: string | null
}

// Application with participant joined
export interface ApplicationWithParticipant extends Application {
  participant: Participant
}

// ─────────────────────────────────────────
// Event
// ─────────────────────────────────────────

export interface Event {
  id: string
  title: string
  event_date: string
  location: string | null
  description: string | null
  status: EventStatus
  notes: string | null
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────
// Event Participation (join table)
// ─────────────────────────────────────────

export interface EventParticipation {
  id: string
  participant_id: string
  event_id: string
  application_id: string | null
  attendance_status: AttendanceStatus
  organizer_notes: string | null
}

export interface EventParticipationWithParticipant extends EventParticipation {
  participant: Participant
}

// ─────────────────────────────────────────
// Interview
// ─────────────────────────────────────────

export interface Interview {
  id: string
  participant_id: string
  application_id: string
  scheduled_at: string | null
  completed_at: string | null
  notes: string | null
  outcome: InterviewOutcome
}

// ─────────────────────────────────────────
// Match Outcome / Post-Event Interest
// ─────────────────────────────────────────

export interface MatchOutcome {
  id: string
  event_id: string
  participant_a_id: string
  participant_b_id: string
  interest_status: InterestStatus
  organizer_notes: string | null
  created_at: string
  updated_at: string
}

export interface MatchOutcomeWithParticipants extends MatchOutcome {
  participant_a: Participant
  participant_b: Participant
}

// ─────────────────────────────────────────
// Form Types (for React Hook Form)
// ─────────────────────────────────────────

// Section 1 of the application form
export interface ApplicationFormSection1 {
  full_name: string
  contact_info: string
  gender: Gender
  age: number
  birthday: string
  work: string
}

// Section 2 of the application form
export interface ApplicationFormSection2 {
  priority_weights: PriorityWeights
  ready_for_love: ReadinessForLove
  grand_amour: string
  preferred_partner_age_min: number
  preferred_partner_age_max: number
  okay_with_some_deviation: boolean
  has_kids: LifestylePreference
  partner_has_kids: LifestylePreference
  travels_world: LifestylePreference
  partner_travels_world: LifestylePreference
  is_divorced: LifestylePreference
  partner_is_divorced: LifestylePreference
  smokes_drug_friendly: LifestylePreference
  partner_smokes_drug_friendly: LifestylePreference
  has_tattoos: LifestylePreference
  partner_has_tattoos: LifestylePreference
  fitness_level: LifestylePreference
  partner_fitness: LifestylePreference
  close_with_family: LifestylePreference
  partner_close_with_family: LifestylePreference
}

// Section 3 of the application form
export interface ApplicationFormSection3 {
  dream_city: string
  ask_out_preference: string
  comfortable_with_man_asking_woman: boolean
  comfortable_with_alcohol_meetcute: boolean
  life_in_5_years: string
  last_thing_that_made_you_laugh: string
  dream_date: string
  family_notes: string
  vice_or_red_flag: string
  dealbreaker: string
  random_curiosities: string
  referral_notes: string
  values_or_worldview: string
}

export type ApplicationFormData = ApplicationFormSection1 &
  ApplicationFormSection2 &
  ApplicationFormSection3
