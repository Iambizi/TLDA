import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

async function requireOrganizer(ctx: { auth: any }) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Unauthorized')
  return userId
}

const interestStatus = v.union(
  v.literal('potential_match'),
  v.literal('one_sided_interest'),
  v.literal('mutual_interest'),
  v.literal('no_match'),
  v.literal('follow_up_needed'),
  v.literal('introduced_off_platform')
)

export const listByEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    const matches = await ctx.db
      .query('matchOutcomes')
      .withIndex('by_event', (q) => q.eq('event_id', args.eventId))
      .collect()

    return await Promise.all(
      matches.map(async (m) => {
        const participantA = await ctx.db.get(m.participant_a_id)
        const participantB = await ctx.db.get(m.participant_b_id)
        return { ...m, participantA, participantB }
      })
    )
  },
})

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireOrganizer(ctx)

    const matches = await ctx.db.query('matchOutcomes').order('desc').collect()

    return await Promise.all(
      matches.map(async (m) => {
        const participantA = await ctx.db.get(m.participant_a_id)
        const participantB = await ctx.db.get(m.participant_b_id)
        const event = await ctx.db.get(m.event_id)
        return { ...m, participantA, participantB, event }
      })
    )
  },
})

export const logMatchOutcome = mutation({
  args: {
    event_id: v.id('events'),
    participant_a_id: v.id('participants'),
    participant_b_id: v.id('participants'),
    interest_status: interestStatus,
    organizer_notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    if (args.participant_a_id === args.participant_b_id) {
      throw new Error('A participant cannot be matched with themselves.')
    }

    // Prevent duplicate pairs per event (in either direction)
    const existingA = await ctx.db
      .query('matchOutcomes')
      .withIndex('by_event', (q) => q.eq('event_id', args.event_id))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field('participant_a_id'), args.participant_a_id),
            q.eq(q.field('participant_b_id'), args.participant_b_id)
          ),
          q.and(
            q.eq(q.field('participant_a_id'), args.participant_b_id),
            q.eq(q.field('participant_b_id'), args.participant_a_id)
          )
        )
      )
      .first()

    if (existingA) {
      throw new Error(
        'A match outcome between these two participants is already logged for this event.'
      )
    }

    const now = Date.now()
    await ctx.db.insert('matchOutcomes', {
      event_id: args.event_id,
      participant_a_id: args.participant_a_id,
      participant_b_id: args.participant_b_id,
      interest_status: args.interest_status,
      organizer_notes: args.organizer_notes,
      updatedAt: now,
    })
  },
})
