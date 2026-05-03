import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getDuplicates = query({
  args: {
    contacts: v.array(v.string()),
    names: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // This is a bit inefficient for large arrays, but works for our small-scale MVP.
    // For large scale, we would use an index.
    const allParticipants = await ctx.db.query("participants").collect();
    
    return allParticipants.filter(p => 
      (p.contact_info && args.contacts.includes(p.contact_info)) ||
      (p.full_name && args.names.includes(p.full_name))
    ).map(p => ({
      id: p._id,
      contact_info: p.contact_info,
      full_name: p.full_name,
      birthday: p.birthday,
    }));
  },
});
