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

export const executeCsvImport = mutation({
  args: {
    eventId: v.optional(v.string()),
    rows: v.array(v.any()), // array of PreparedImportRow.parsedData & specialData combined
  },
  handler: async (ctx, args) => {
    let insertedCount = 0;
    const now = Date.now();

    for (const row of args.rows) {
      const { specialData, ...parsedData } = row;
      
      // 1. Insert Participant
      const participantId = await ctx.db.insert("participants", {
        ...parsedData,
        dealbreaker: specialData?.dealbreaker || parsedData.dealbreaker || undefined,
        dynamic_answers: specialData?.dynamic_answers || undefined,
        updatedAt: now,
      });

      // 2. Insert Application (assume approved)
      const applicationId = await ctx.db.insert("applications", {
        participant_id: participantId,
        submitted_at: now,
        status: "approved",
        interview_required: false,
        interview_completed: true,
        assigned_event_id: args.eventId ? (args.eventId as any) : undefined,
      });

      // 3. Insert Interview if there are interview notes
      if (specialData?.interview_notes) {
        await ctx.db.insert("interviews", {
          participant_id: participantId,
          application_id: applicationId,
          completed_at: now,
          notes: specialData.interview_notes,
          outcome: "completed",
        });
      }

      // 4. Insert EventParticipant if eventId is provided
      if (args.eventId) {
        let paymentAmount = undefined;
        if (specialData?.payment_amount) {
          const lower = specialData.payment_amount.trim().toLowerCase();
          if (lower === "yes" || lower === "y") {
            paymentAmount = 50; // default as discussed
          } else {
            const parsedAmount = parseFloat(specialData.payment_amount.replace(/[$,\s]/g, ""));
            if (!isNaN(parsedAmount)) {
              paymentAmount = parsedAmount;
            }
          }
        }

        let attendanceStatus = "invited";
        if (specialData?.attendance_status) {
           const statusText = specialData.attendance_status.toLowerCase();
           if (statusText.includes("interview complete") || statusText.includes("confirmed")) {
             attendanceStatus = "confirmed";
           } else if (statusText.includes("waitlist")) {
             attendanceStatus = "waitlisted";
           } else if (statusText.includes("cancel") || statusText.includes("not available")) {
             attendanceStatus = "cancelled";
           } else if (statusText.includes("attended")) {
             attendanceStatus = "attended";
           }
        }

        await ctx.db.insert("eventParticipants", {
          participant_id: participantId,
          event_id: args.eventId as any,
          application_id: applicationId,
          attendance_status: attendanceStatus as any,
          payment_amount: paymentAmount,
        });
      }

      insertedCount++;
    }

    return { insertedCount };
  },
});
