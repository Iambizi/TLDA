import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

async function requireOrganizer(ctx: { auth: any }) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Unauthorized')
  return userId
}

// ─── Queries ──────────────────────────────────────────────────

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    // Only organizers should edit it, but anyone can read it for the form
    // We won't require auth here if it's used on the public /apply page later.
    // For now, let's keep it public so the apply page can use it.
    
    return await ctx.db
      .query('questionnaires')
      .filter((q) => q.eq(q.field('is_active'), true))
      .order('desc')
      .first()
  },
})

// ─── Mutations ────────────────────────────────────────────────

export const saveActive = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    fields: v.array(v.any()), // array of field definitions
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)
    const now = Date.now()

    // Find the currently active questionnaire
    const active = await ctx.db
      .query('questionnaires')
      .filter((q) => q.eq(q.field('is_active'), true))
      .first()

    if (active) {
      // Deactivate the old one (or just update it)
      // Usually, updating is easier unless we want version history.
      // Let's just update the current one.
      await ctx.db.patch(active._id, {
        title: args.title,
        description: args.description,
        fields: args.fields,
        updatedAt: now,
      })
      return active._id
    } else {
      // Create a new one if none exists
      return await ctx.db.insert('questionnaires', {
        title: args.title,
        description: args.description,
        fields: args.fields,
        is_active: true,
        updatedAt: now,
      })
    }
  },
})
