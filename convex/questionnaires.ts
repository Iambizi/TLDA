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
    return await ctx.db
      .query('questionnaires')
      .filter((q) => q.eq(q.field('is_active'), true))
      .order('desc')
      .first()
  },
})

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireOrganizer(ctx)
    return await ctx.db.query('questionnaires').order('desc').collect()
  },
})

// ─── Mutations ────────────────────────────────────────────────

export const createQuestionnaire = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    fields: v.array(v.any()), // array of field definitions
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)
    const now = Date.now()
    
    // Check if there are any questionnaires at all
    const existing = await ctx.db.query('questionnaires').first()
    const isFirst = !existing

    return await ctx.db.insert('questionnaires', {
      title: args.title,
      description: args.description,
      fields: args.fields,
      is_active: isFirst, // Make it active if it's the very first one
      updatedAt: now,
    })
  },
})

export const saveQuestionnaire = mutation({
  args: {
    id: v.id('questionnaires'),
    title: v.string(),
    description: v.optional(v.string()),
    fields: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)
    const now = Date.now()
    
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      fields: args.fields,
      updatedAt: now,
    })
    return args.id
  },
})

export const setActiveQuestionnaire = mutation({
  args: { id: v.id('questionnaires') },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)
    
    // Deactivate all others
    const all = await ctx.db.query('questionnaires').collect()
    for (const q of all) {
      if (q.is_active && q._id !== args.id) {
        await ctx.db.patch(q._id, { is_active: false })
      }
    }
    
    // Activate target
    await ctx.db.patch(args.id, { is_active: true })
  },
})

export const deleteQuestionnaire = mutation({
  args: { id: v.id('questionnaires') },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)
    const q = await ctx.db.get(args.id)
    if (!q) throw new Error('Questionnaire not found')
    if (q.is_active) throw new Error('Cannot delete the active questionnaire')
    
    await ctx.db.delete(args.id)
  },
})


