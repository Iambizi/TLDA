import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Clears all participant-related imported data.
 * Safe to run multiple times. Use before re-seeding from CSV.
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const [eps, interviews, applications, participants] = await Promise.all([
      ctx.db.query("eventParticipants").collect(),
      ctx.db.query("interviews").collect(),
      ctx.db.query("applications").collect(),
      ctx.db.query("participants").collect(),
    ]);

    for (const r of eps) await ctx.db.delete(r._id);
    for (const r of interviews) await ctx.db.delete(r._id);
    for (const r of applications) await ctx.db.delete(r._id);
    for (const r of participants) await ctx.db.delete(r._id);

    return {
      deleted: {
        eventParticipants: eps.length,
        interviews: interviews.length,
        applications: applications.length,
        participants: participants.length,
      },
    };
  },
});

/** No-auth event list — for use in seed scripts only */
export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("events").collect();
  },
});

/** No-auth event creation — for use in seed scripts only */
export const createEvent = mutation({
  args: {
    title: v.string(),
    event_date: v.optional(v.number()),
    location: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("events", {
      title: args.title,
      event_date: args.event_date,
      location: args.location,
      status: (args.status as any) || "completed",
      updatedAt: now,
    });
  },
});

/** No-auth eventParticipants list — for use in repair scripts only */
export const listAllEventParticipants = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("eventParticipants").collect();
  },
});

/** No-auth direct event assignment — for use in repair scripts only */
export const assignParticipantToEvent = mutation({
  args: {
    participant_id: v.string(),
    event_id: v.string(),
    application_id: v.optional(v.string()),
    attendance_status: v.optional(v.string()),
    payment_amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("eventParticipants", {
      participant_id: args.participant_id as any,
      event_id: args.event_id as any,
      application_id: args.application_id as any,
      attendance_status: (args.attendance_status as any) || "attended",
      payment_amount: args.payment_amount,
    });
  },
});
