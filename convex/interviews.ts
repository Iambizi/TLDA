import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

async function requireOrganizer(ctx: { auth: any }) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Unauthorized')
  return userId
}

export const logInterview = mutation({
  args: {
    participant_id: v.id('participants'),
    application_id: v.id('applications'),
    scheduled_at: v.optional(v.number()), // Unix ms
    outcome: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('no_show'),
      v.literal('follow_up_needed')
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    await ctx.db.insert('interviews', {
      participant_id: args.participant_id,
      application_id: args.application_id,
      scheduled_at: args.scheduled_at,
      outcome: args.outcome,
      notes: args.notes,
    })

    // Sync application interview fields
    await ctx.db.patch(args.application_id, {
      interview_completed: args.outcome === 'completed',
      interview_date: args.scheduled_at,
    })
  },
})
