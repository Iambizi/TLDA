import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

// ─── Shared Enum Validators ───────────────────────────────────

const applicationStatus = v.union(
  v.literal('applied'),
  v.literal('under_review'),
  v.literal('interview_requested'),
  v.literal('interviewed'),
  v.literal('approved'),
  v.literal('waitlisted'),
  v.literal('declined'),
  v.literal('assigned_to_event'),
  v.literal('attended'),
  v.literal('archived')
)

const eventStatus = v.union(
  v.literal('draft'),
  v.literal('open'),
  v.literal('closed'),
  v.literal('completed'),
  v.literal('archived')
)

const attendanceStatus = v.union(
  v.literal('invited'),
  v.literal('confirmed'),
  v.literal('waitlisted'),
  v.literal('attended'),
  v.literal('no_show'),
  v.literal('cancelled')
)

const interviewOutcome = v.union(
  v.literal('pending'),
  v.literal('completed'),
  v.literal('no_show'),
  v.literal('follow_up_needed')
)

const interestStatus = v.union(
  v.literal('connected'),
  v.literal('exchanged_contacts'),
  v.literal('went_on_date'),
  v.literal('in_relationship'),
  v.literal('no_follow_up')
)

const readinessForLove = v.union(
  v.literal('yes'),
  v.literal('not_sure'),
  v.literal('no')
)

const lifestylePreference = v.union(
  v.literal('want'),
  v.literal('dont_want'),
  v.literal('flexible')
)

// ─── Schema Definition ────────────────────────────────────────

export default defineSchema({
  ...authTables,

  // ─── participants ─────────────────────────────────────────
  // NOTE: values_or_worldview is a sensitive organizer-only field.
  // It must never appear in participant-facing views or list columns.
  participants: defineTable({
    // Basic Info
    full_name: v.string(),
    contact_info: v.string(),
    gender: v.optional(v.string()),
    age: v.optional(v.number()),
    birthday: v.optional(v.string()), // ISO date string
    work: v.optional(v.string()),

    // About Self (Section 3 of form)
    dream_city: v.optional(v.string()),
    ask_out_preference: v.optional(v.string()),
    comfortable_with_man_asking_woman: v.optional(v.boolean()),
    comfortable_with_alcohol_meetcute: v.optional(v.boolean()),
    life_in_5_years: v.optional(v.string()),
    last_thing_that_made_you_laugh: v.optional(v.string()),
    dream_date: v.optional(v.string()),
    family_notes: v.optional(v.string()),
    vice_or_red_flag: v.optional(v.string()),
    dealbreaker: v.optional(v.string()),
    random_curiosities: v.optional(v.string()),
    referral_notes: v.optional(v.string()),

    // SENSITIVE — organizer-only, never expose in participant-facing views
    values_or_worldview: v.optional(v.string()),

    // Partner Preferences: Priority Weights (Venn)
    // Values must sum to 100.
    priority_weights: v.optional(
      v.object({
        pedigree: v.number(),
        looks: v.number(),
        personality: v.number(),
      })
    ),

    // Partner Preferences: Readiness
    ready_for_love: v.optional(readinessForLove),
    grand_amour: v.optional(v.string()),

    // Partner Preferences: Age Range
    preferred_partner_age_min: v.optional(v.number()),
    preferred_partner_age_max: v.optional(v.number()),
    okay_with_some_deviation: v.optional(v.boolean()),

    // Lifestyle Attribute Pairs
    has_kids: v.optional(lifestylePreference),
    partner_has_kids: v.optional(lifestylePreference),
    travels_world: v.optional(lifestylePreference),
    partner_travels_world: v.optional(lifestylePreference),
    is_divorced: v.optional(lifestylePreference),
    partner_is_divorced: v.optional(lifestylePreference),
    smokes_drug_friendly: v.optional(lifestylePreference),
    partner_smokes_drug_friendly: v.optional(lifestylePreference),
    has_tattoos: v.optional(lifestylePreference),
    partner_has_tattoos: v.optional(lifestylePreference),
    fitness_level: v.optional(lifestylePreference),
    partner_fitness: v.optional(lifestylePreference),
    close_with_family: v.optional(lifestylePreference),
    partner_close_with_family: v.optional(lifestylePreference),

    // Timestamps
    updatedAt: v.number(), // Unix ms — set explicitly on every write

    // v3 Fields
    is_draft: v.optional(v.boolean()),
    dynamic_answers: v.optional(v.any()),
    photo_storage_id: v.optional(v.id('_storage')),
  }),

  // ─── events ───────────────────────────────────────────────
  events: defineTable({
    title: v.string(),
    event_date: v.optional(v.number()), // Unix ms
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    status: eventStatus,
    notes: v.optional(v.string()),
    updatedAt: v.number(),
    photo_storage_id: v.optional(v.id('_storage')),
  }),

  // ─── applications ─────────────────────────────────────────
  applications: defineTable({
    participant_id: v.id('participants'),
    submitted_at: v.number(), // Unix ms
    source_event_id: v.optional(v.id('events')),
    status: applicationStatus,
    organizer_notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    interview_required: v.boolean(),
    interview_completed: v.boolean(),
    interview_date: v.optional(v.number()), // Unix ms
    assigned_event_id: v.optional(v.id('events')),
  })
    .index('by_participant', ['participant_id'])
    .index('by_status', ['status'])
    .index('by_assigned_event', ['assigned_event_id']),

  // ─── interviews ───────────────────────────────────────────
  interviews: defineTable({
    participant_id: v.id('participants'),
    application_id: v.id('applications'),
    scheduled_at: v.optional(v.number()), // Unix ms
    completed_at: v.optional(v.number()), // Unix ms
    notes: v.optional(v.string()),
    outcome: interviewOutcome,
  })
    .index('by_participant', ['participant_id'])
    .index('by_application', ['application_id']),

  // ─── eventParticipants ────────────────────────────────────
  // Join table between participants and events
  eventParticipants: defineTable({
    participant_id: v.id('participants'),
    event_id: v.id('events'),
    application_id: v.optional(v.id('applications')),
    attendance_status: attendanceStatus,
    organizer_notes: v.optional(v.string()),
    payment_amount: v.optional(v.number()),
  })
    .index('by_event', ['event_id'])
    .index('by_participant', ['participant_id'])
    .index('by_event_and_participant', ['event_id', 'participant_id']),

  // ─── matchOutcomes ────────────────────────────────────────
  // Organizer-recorded post-event interest signals. Not algorithmic.
  matchOutcomes: defineTable({
    event_id: v.id('events'),
    participant_a_id: v.id('participants'),
    participant_b_id: v.id('participants'),
    interest_status: interestStatus,
    organizer_notes: v.optional(v.string()),
    updatedAt: v.number(),
    follow_up_date: v.optional(v.number()),
  })
    .index('by_event', ['event_id'])
    .index('by_participant_a', ['participant_a_id'])
    .index('by_participant_b', ['participant_b_id']),

  // ─── questionnaires ─────────────────────────────────────────
  questionnaires: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    fields: v.array(v.any()), // array of field definitions
    is_active: v.boolean(),
    updatedAt: v.number(),
  }),

  // ─── eventExpenses ──────────────────────────────────────────
  eventExpenses: defineTable({
    event_id: v.id('events'),
    description: v.string(),
    amount: v.number(),
    updatedAt: v.number(),
  })
    .index('by_event', ['event_id']),
})
