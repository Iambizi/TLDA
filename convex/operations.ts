import { query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

async function requireOrganizer(ctx: { auth: any }) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Unauthorized')
  return userId
}

export const getDashboardData = query({
  args: {},
  handler: async (ctx) => {
    await requireOrganizer(ctx)

    const events = await ctx.db.query('events').order('desc').collect()

    let globalRevenue = 0
    let globalCosts = 0

    const eventsData = await Promise.all(
      events.map(async (e) => {
        // Get Roster
        const roster = await ctx.db
          .query('eventParticipants')
          .withIndex('by_event', (q) => q.eq('event_id', e._id))
          .collect()

        const eventRevenue = roster.reduce((sum, r) => sum + (r.payment_amount || 0), 0)

        // Get Expenses
        const expenses = await ctx.db
          .query('eventExpenses')
          .withIndex('by_event', (q) => q.eq('event_id', e._id))
          .collect()

        const eventCosts = expenses.reduce((sum, exp) => sum + exp.amount, 0)

        globalRevenue += eventRevenue
        globalCosts += eventCosts

        return {
          id: e._id,
          title: e.title,
          status: e.status,
          date: e.event_date,
          participantCount: roster.length,
          revenue: eventRevenue,
          costs: eventCosts,
          net: eventRevenue - eventCosts,
        }
      })
    )

    return {
      globalRevenue,
      globalCosts,
      globalNet: globalRevenue - globalCosts,
      events: eventsData,
    }
  },
})
