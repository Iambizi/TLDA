import { z } from 'zod'

// ─── Enum Schemas ────────────────────────────────────────────

export const ApplicationStatusSchema = z.enum([
  'applied',
  'under_review',
  'interview_requested',
  'interviewed',
  'approved',
  'waitlisted',
  'declined',
  'assigned_to_event',
  'attended',
  'archived',
])

export const EventStatusSchema = z.enum([
  'draft',
  'open',
  'closed',
  'completed',
  'archived',
])

export const AttendanceStatusSchema = z.enum([
  'invited',
  'confirmed',
  'waitlisted',
  'attended',
  'no_show',
  'cancelled',
])

export const InterviewOutcomeSchema = z.enum([
  'pending',
  'completed',
  'no_show',
  'follow_up_needed',
])

export const InterestStatusSchema = z.enum([
  'potential_match',
  'one_sided_interest',
  'mutual_interest',
  'no_match',
  'follow_up_needed',
  'introduced_off_platform',
])

export const ReadinessForLoveSchema = z.enum(['yes', 'not_sure', 'no'])

export const LifestylePreferenceSchema = z.enum(['want', 'dont_want', 'flexible'])

// ─── Priority Weights (Venn) ─────────────────────────────────
// Values must be numbers that collectively sum to 100.
// Stored as JSON — schema is intentionally flexible (uses record, not fixed keys).

export const PriorityWeightsSchema = z
  .record(z.string(), z.number().min(0).max(100))
  .refine(
    (weights) => {
      const total = Object.values(weights).reduce((sum, v) => sum + v, 0)
      return Math.round(total) === 100
    },
    { message: 'Priority weights must sum to 100' }
  )

// ─── Section 1 — Basic Info ───────────────────────────────────

export const Section1Schema = z.object({
  full_name: z.string().min(1, 'Name is required').max(200),
  contact_info: z
    .string()
    .min(1, 'Contact info is required')
    .max(500)
    .describe('Email, phone, or Instagram — however you prefer to be reached'),
  gender: z.string().min(1, 'Gender is required').max(100),
  age: z
    .number({ error: 'Age must be a number' })
    .int()
    .min(18, 'Must be 18 or older')
    .max(120),
  birthday: z.string().min(1, 'Birthday is required'), // ISO date string
  work: z.string().max(500).optional().default(''),
})

// ─── Section 2 — Ideal Partner ───────────────────────────────

export const Section2Schema = z.object({
  // Venn sliders
  priority_weights: PriorityWeightsSchema,

  // Readiness
  ready_for_love: ReadinessForLoveSchema,
  grand_amour: z.string().max(1000).optional().default(''),

  // Age range
  preferred_partner_age_min: z
    .number({ error: 'Must be a number' })
    .int()
    .min(18)
    .max(120),
  preferred_partner_age_max: z
    .number({ error: 'Must be a number' })
    .int()
    .min(18)
    .max(120),
  okay_with_some_deviation: z.boolean().default(false),

  // Lifestyle pairs — self
  has_kids: LifestylePreferenceSchema,
  travels_world: LifestylePreferenceSchema,
  is_divorced: LifestylePreferenceSchema,
  smokes_drug_friendly: LifestylePreferenceSchema,
  has_tattoos: LifestylePreferenceSchema,
  fitness_level: LifestylePreferenceSchema,
  close_with_family: LifestylePreferenceSchema,

  // Lifestyle pairs — partner preference
  partner_has_kids: LifestylePreferenceSchema,
  partner_travels_world: LifestylePreferenceSchema,
  partner_is_divorced: LifestylePreferenceSchema,
  partner_smokes_drug_friendly: LifestylePreferenceSchema,
  partner_has_tattoos: LifestylePreferenceSchema,
  partner_fitness: LifestylePreferenceSchema,
  partner_close_with_family: LifestylePreferenceSchema,
}).refine(
  (data) => data.preferred_partner_age_max >= data.preferred_partner_age_min,
  {
    message: 'Max age must be greater than or equal to min age',
    path: ['preferred_partner_age_max'],
  }
)

// ─── Section 3 — About You ───────────────────────────────────
// NOTE: values_or_worldview is a free-text field.
// On the public form, present it neutrally (e.g. "Values & Worldview").
// In the admin UI, never render the field key as a visible label.

export const Section3Schema = z.object({
  dream_city: z.string().max(200).optional().default(''),
  ask_out_preference: z.string().max(1000).optional().default(''),
  comfortable_with_man_asking_woman: z.boolean().optional().default(false),
  comfortable_with_alcohol_meetcute: z.boolean().optional().default(false),
  life_in_5_years: z.string().max(2000).optional().default(''),
  last_thing_that_made_you_laugh: z.string().max(2000).optional().default(''),
  dream_date: z.string().max(2000).optional().default(''),
  family_notes: z.string().max(2000).optional().default(''),
  vice_or_red_flag: z.string().max(1000).optional().default(''),
  dealbreaker: z.string().max(1000).optional().default(''),
  random_curiosities: z.string().max(2000).optional().default(''),
  referral_notes: z.string().max(500).optional().default(''),
  // SENSITIVE — see above
  values_or_worldview: z.string().max(2000).optional().default(''),
})

// ─── Full Application Form ────────────────────────────────────

export const ApplicationFormSchema = Section1Schema.merge(Section2Schema).merge(Section3Schema)

export type ApplicationFormValues = z.infer<typeof ApplicationFormSchema>
export type Section1Values = z.infer<typeof Section1Schema>
export type Section2Values = z.infer<typeof Section2Schema>
export type Section3Values = z.infer<typeof Section3Schema>

// ─── Application (DB record) ──────────────────────────────────

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  participant_id: z.string().uuid(),
  submitted_at: z.string().datetime(),
  source_event_id: z.string().uuid().nullable(),
  status: ApplicationStatusSchema,
  organizer_notes: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  interview_required: z.boolean(),
  interview_completed: z.boolean(),
  interview_date: z.string().datetime().nullable(),
  assigned_event_id: z.string().uuid().nullable(),
})

// ─── Event ───────────────────────────────────────────────────

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(300),
  event_date: z.string().datetime().nullable(),
  location: z.string().max(500).nullable(),
  description: z.string().nullable(),
  status: EventStatusSchema,
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  event_date: z.string().nullable().optional(),
  location: z.string().max(500).optional(),
  description: z.string().optional(),
  status: EventStatusSchema.default('draft'),
  notes: z.string().optional(),
})

// ─── Event Participation ──────────────────────────────────────

export const EventParticipationSchema = z.object({
  id: z.string().uuid(),
  participant_id: z.string().uuid(),
  event_id: z.string().uuid(),
  application_id: z.string().uuid().nullable(),
  attendance_status: AttendanceStatusSchema,
  organizer_notes: z.string().nullable(),
})

// ─── Interview ────────────────────────────────────────────────

export const InterviewSchema = z.object({
  id: z.string().uuid(),
  participant_id: z.string().uuid(),
  application_id: z.string().uuid(),
  scheduled_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  outcome: InterviewOutcomeSchema,
})

export const CreateInterviewSchema = z.object({
  participant_id: z.string().uuid(),
  application_id: z.string().uuid(),
  scheduled_at: z.string().datetime().nullable().optional(),
  notes: z.string().optional(),
  outcome: InterviewOutcomeSchema.default('pending'),
})

// ─── Match Outcome ────────────────────────────────────────────

export const MatchOutcomeSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  participant_a_id: z.string().uuid(),
  participant_b_id: z.string().uuid(),
  interest_status: InterestStatusSchema,
  organizer_notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const CreateMatchOutcomeSchema = z.object({
  event_id: z.string().uuid(),
  participant_a_id: z.string().uuid(),
  participant_b_id: z.string().uuid(),
  interest_status: InterestStatusSchema.default('potential_match'),
  organizer_notes: z.string().optional(),
}).refine(
  (data) => data.participant_a_id !== data.participant_b_id,
  { message: 'A participant cannot be matched with themselves', path: ['participant_b_id'] }
)

// ─── Organizer Note Update ────────────────────────────────────

export const OrganizerNoteSchema = z.object({
  organizer_notes: z.string().max(5000),
})

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatusSchema,
  organizer_notes: z.string().max(5000).optional(),
})
