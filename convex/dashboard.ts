import { query } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

async function requireOrganizer(ctx: { auth: any }) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Unauthorized')
  return userId
}

/**
 * Dashboard summary query — counts by status + recent submissions + upcoming events.
 */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    await requireOrganizer(ctx)

    const [allApplications, allEvents] = await Promise.all([
      ctx.db.query('applications').collect(),
      ctx.db.query('events').collect(),
    ])

    // Count by application status
    const statusCounts: Record<string, number> = {}
    for (const app of allApplications) {
      statusCounts[app.status] = (statusCounts[app.status] ?? 0) + 1
    }

    // Recent submissions (last 10 by submitted_at)
    const recent = [...allApplications]
      .sort((a, b) => b.submitted_at - a.submitted_at)
      .slice(0, 10)

    const recentWithParticipants = await Promise.all(
      recent.map(async (app) => {
        const participant = await ctx.db.get(app.participant_id)
        return { ...app, participant: participant ?? null }
      })
    )

    const now = Date.now()
    const upcomingEvents = allEvents
      .filter(
        (e) =>
          (e.status === 'open' || e.status === 'draft') &&
          (!e.event_date || e.event_date >= now)
      )
      .sort((a, b) => (a.event_date ?? 0) - (b.event_date ?? 0))
      .slice(0, 5)

    const pendingReview = (statusCounts['applied'] || 0) + (statusCounts['under_review'] || 0)
    
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const newThisWeek = allApplications.filter(app => app.submitted_at >= oneWeekAgo).length

    return {
      totalApplications: allApplications.length,
      pendingReview,
      newThisWeek,
      upcomingEvents: upcomingEvents.length,
      statusCounts,
      recentSubmissions: recentWithParticipants,
    }
  },
})
