import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

async function requireOrganizer(ctx: { auth: any }) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Unauthorized')
  return userId
}

const eventStatus = v.union(
  v.literal('draft'),
  v.literal('open'),
  v.literal('closed'),
  v.literal('completed'),
  v.literal('archived')
)

// ─── Queries ──────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireOrganizer(ctx)
    const events = await ctx.db.query('events').order('desc').collect()
    return await Promise.all(
      events.map(async (e) => {
        const roster = await ctx.db
          .query('eventParticipants')
          .withIndex('by_event', (q) => q.eq('event_id', e._id))
          .collect()
        return { ...e, rosterCount: roster.length }
      })
    )
  },
})

export const getById = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    const event = await ctx.db.get(args.id)
    if (!event) return null

    const rosterRows = await ctx.db
      .query('eventParticipants')
      .withIndex('by_event', (q) => q.eq('event_id', args.id))
      .collect()

    const rosterWithParticipants = await Promise.all(
      rosterRows.map(async (row) => {
        const participant = await ctx.db.get(row.participant_id)
        return { ...row, participant: participant ?? null }
      })
    )

    // All approved participants not yet on the roster
    const rosterParticipantIds = new Set(
      rosterRows.map((r) => r.participant_id)
    )
    const allParticipants = await ctx.db.query('participants').collect()
    const availableParticipants = []
    for (const p of allParticipants) {
      if (rosterParticipantIds.has(p._id)) continue
      const app = await ctx.db
        .query('applications')
        .withIndex('by_participant', (q) => q.eq('participant_id', p._id))
        .order('desc')
        .first()
      if (app && app.status === 'approved') {
        availableParticipants.push({ ...p, application: app })
      }
    }

    return { ...event, roster: rosterWithParticipants, availableParticipants }
  },
})

// ─── Mutations ────────────────────────────────────────────────

export const createEvent = mutation({
  args: {
    title: v.string(),
    event_date: v.optional(v.number()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    status: eventStatus,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)
    const now = Date.now()

    const eventId = await ctx.db.insert('events', {
      title: args.title,
      event_date: args.event_date,
      location: args.location,
      description: args.description,
      status: args.status,
      notes: args.notes,
      updatedAt: now,
    })

    return eventId
  },
})

export const assignParticipant = mutation({
  args: {
    eventId: v.id('events'),
    participantId: v.id('participants'),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    // Check if already assigned
    const existing = await ctx.db
      .query('eventParticipants')
      .withIndex('by_event_and_participant', (q) =>
        q.eq('event_id', args.eventId).eq('participant_id', args.participantId)
      )
      .first()

    if (existing) {
      throw new Error('Participant is already assigned to this event.')
    }

    // Get most recent application to link
    const application = await ctx.db
      .query('applications')
      .withIndex('by_participant', (q) =>
        q.eq('participant_id', args.participantId)
      )
      .order('desc')
      .first()

    await ctx.db.insert('eventParticipants', {
      event_id: args.eventId,
      participant_id: args.participantId,
      application_id: application?._id,
      attendance_status: 'invited',
    })

    // Sync application status
    if (application) {
      await ctx.db.patch(application._id, {
        status: 'assigned_to_event',
        assigned_event_id: args.eventId,
      })
    }
  },
})

export const removeParticipant = mutation({
  args: {
    eventId: v.id('events'),
    participantId: v.id('participants'),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    const row = await ctx.db
      .query('eventParticipants')
      .withIndex('by_event_and_participant', (q) =>
        q.eq('event_id', args.eventId).eq('participant_id', args.participantId)
      )
      .first()

    if (!row) return

    await ctx.db.delete(row._id)

    // Revert application status if it was assigned_to_event for this event
    if (row.application_id) {
      const application = await ctx.db.get(row.application_id)
      if (
        application &&
        application.status === 'assigned_to_event' &&
        application.assigned_event_id === args.eventId
      ) {
        await ctx.db.patch(application._id, {
          status: 'approved',
          assigned_event_id: undefined,
        })
      }
    }
  },
})

export const updateAttendanceStatus = mutation({
  args: {
    eventId: v.id('events'),
    participantId: v.id('participants'),
    status: v.union(
      v.literal('invited'),
      v.literal('confirmed'),
      v.literal('waitlisted'),
      v.literal('attended'),
      v.literal('no_show'),
      v.literal('cancelled')
    ),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)

    const row = await ctx.db
      .query('eventParticipants')
      .withIndex('by_event_and_participant', (q) =>
        q.eq('event_id', args.eventId).eq('participant_id', args.participantId)
      )
      .first()

    if (!row) throw new Error('Participant not found in event roster.')

    await ctx.db.patch(row._id, { attendance_status: args.status })
  },
})

export const updateEvent = mutation({
  args: {
    id: v.id('events'),
    title: v.optional(v.string()),
    event_date: v.optional(v.number()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(eventStatus),
    notes: v.optional(v.string()),
    photo_storage_id: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireOrganizer(ctx)
    const { id, ...fields } = args
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() })
  },
})
