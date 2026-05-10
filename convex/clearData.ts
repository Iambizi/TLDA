import { mutation, query } from "./_generated/server";

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
