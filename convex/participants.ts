import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

// ─── Helpers ─────────────────────────────────────────────────

async function requireOrganizer(ctx: { auth: any }) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Unauthorized')
  return userId
}

// ─── Queries ──────────────────────────────────────────────────

/**
 * List all participants with their most recent application.
 * Organizer-only.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireOrganizer(ctx)

    const participants = await ctx.db.query('participants').order('desc').collect()

    const withApplications = await Promise.all(
      participants.map(async (p) => {
        const application = await ctx.db
          .query('applications')
          .withIndex('by_participant', (q) => q.eq('participant_id', p._id))
          .order('desc')
          .first()
        return { ...p, application: application ?? null }
      })
    )

    return withApplications
  },
})

/**
 * Get a single participant by ID with their most recent application and interviews.
 * Organizer-only.
 */
export const getById = query({
  args: { id: v.id('participants') },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    const participant = await ctx.db.get(args.id)
    if (!participant) return null

    const application = await ctx.db
      .query('applications')
      .withIndex('by_participant', (q) => q.eq('participant_id', args.id))
      .order('desc')
      .first()

    const interviews = application
      ? await ctx.db
          .query('interviews')
          .withIndex('by_application', (q) =>
            q.eq('application_id', application._id)
          )
          .collect()
      : []

    const eventParticipation = await ctx.db
      .query('eventParticipants')
      .withIndex('by_participant', (q) => q.eq('participant_id', args.id))
      .collect()

    const events = await Promise.all(
      eventParticipation.map(async (ep) => {
        const event = await ctx.db.get(ep.event_id)
        return event ? { ...ep, event } : null
      })
    )

    return {
      ...participant,
      application: application ?? null,
      interviews,
      events: events.filter(Boolean),
    }
  },
})

// ─── Mutations ────────────────────────────────────────────────

/**
 * Update the application status and/or organizer notes.
 * Organizer-only.
 */
export const updateApplicationReview = mutation({
  args: {
    applicationId: v.id('applications'),
    status: v.union(
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
    ),
    organizer_notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      organizer_notes: args.organizer_notes ?? undefined,
    })
  },
})

/**
 * Delete a participant and all related records (cascade).
 * Order: matchOutcomes → eventParticipants → interviews → applications → participant
 * Organizer-only.
 */
export const deleteParticipant = mutation({
  args: { participantId: v.id('participants') },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    // 1. Delete match outcomes (both sides)
    const matchesA = await ctx.db
      .query('matchOutcomes')
      .withIndex('by_participant_a', (q) =>
        q.eq('participant_a_id', args.participantId)
      )
      .collect()
    const matchesB = await ctx.db
      .query('matchOutcomes')
      .withIndex('by_participant_b', (q) =>
        q.eq('participant_b_id', args.participantId)
      )
      .collect()
    for (const m of [...matchesA, ...matchesB]) {
      await ctx.db.delete(m._id)
    }

    // 2. Delete event participations
    const eventRows = await ctx.db
      .query('eventParticipants')
      .withIndex('by_participant', (q) =>
        q.eq('participant_id', args.participantId)
      )
      .collect()
    for (const ep of eventRows) {
      await ctx.db.delete(ep._id)
    }

    // 3. Delete interviews
    const interviews = await ctx.db
      .query('interviews')
      .withIndex('by_participant', (q) =>
        q.eq('participant_id', args.participantId)
      )
      .collect()
    for (const i of interviews) {
      await ctx.db.delete(i._id)
    }

    // 4. Delete applications
    const applications = await ctx.db
      .query('applications')
      .withIndex('by_participant', (q) =>
        q.eq('participant_id', args.participantId)
      )
      .collect()
    for (const a of applications) {
      await ctx.db.delete(a._id)
    }

    // 5. Delete participant
    await ctx.db.delete(args.participantId)
  },
})

/**
 * Update all editable fields on a participant profile.
 * Organizer-only.
 */
export const updateProfile = mutation({
  args: {
    id: v.id('participants'),
    full_name: v.string(),
    contact_info: v.string(),
    gender: v.optional(v.string()),
    birthday: v.optional(v.string()),
    age: v.optional(v.number()),
    work: v.optional(v.string()),
    // About You
    dream_city: v.optional(v.string()),
    ask_out_preference: v.optional(v.string()),
    life_in_5_years: v.optional(v.string()),
    last_thing_that_made_you_laugh: v.optional(v.string()),
    dream_date: v.optional(v.string()),
    family_notes: v.optional(v.string()),
    vice_or_red_flag: v.optional(v.string()),
    dealbreaker: v.optional(v.string()),
    random_curiosities: v.optional(v.string()),
    referral_notes: v.optional(v.string()),
    values_or_worldview: v.optional(v.string()),
    comfortable_with_man_asking_woman: v.optional(v.boolean()),
    comfortable_with_alcohol_meetcute: v.optional(v.boolean()),
    // Ideal Partner
    ready_for_love: v.optional(v.union(v.literal('yes'), v.literal('not_sure'), v.literal('no'))),
    grand_amour: v.optional(v.string()),
    preferred_partner_age_min: v.optional(v.number()),
    preferred_partner_age_max: v.optional(v.number()),
    okay_with_some_deviation: v.optional(v.boolean()),
    priority_weights: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)
    const { id, ...fields } = args
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() })
  },
})

