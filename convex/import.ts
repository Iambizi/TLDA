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
      const { specialData, priority_weights, ...rest } = row;
      
      // contact_info is required in the schema — use a placeholder if empty
      const contactInfo = (rest.contact_info && String(rest.contact_info).trim()) || `imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`

      // Sanitize priority_weights: Convex schema requires exactly {pedigree, looks, personality}
      // If the weights don't conform, store them in dynamic_answers instead
      let sanitizedWeights = undefined
      if (priority_weights && typeof priority_weights === 'object') {
        const w = priority_weights as Record<string, number>
        if (typeof w.pedigree === 'number' && typeof w.looks === 'number' && typeof w.personality === 'number') {
          sanitizedWeights = { pedigree: w.pedigree, looks: w.looks, personality: w.personality }
        }
      }

      // Merge non-conforming weights into dynamic_answers so no data is lost
      const dynamicAnswers = specialData?.dynamic_answers ? { ...specialData.dynamic_answers } : {}
      if (priority_weights && !sanitizedWeights) {
        dynamicAnswers['_priority_weights_raw'] = priority_weights
      }

      // Strip any keys not in the Convex schema (e.g. from Zod partial output)
      const allowedParticipantKeys = new Set([
        'full_name','contact_info','gender','age','birthday','work',
        'dream_city','ask_out_preference','comfortable_with_man_asking_woman',
        'comfortable_with_alcohol_meetcute','life_in_5_years','last_thing_that_made_you_laugh',
        'dream_date','family_notes','vice_or_red_flag','dealbreaker','random_curiosities',
        'referral_notes','values_or_worldview','priority_weights','ready_for_love','grand_amour',
        'preferred_partner_age_min','preferred_partner_age_max','okay_with_some_deviation',
        'has_kids','partner_has_kids','travels_world','partner_travels_world','is_divorced',
        'partner_is_divorced','smokes_drug_friendly','partner_smokes_drug_friendly','has_tattoos',
        'partner_has_tattoos','fitness_level','partner_fitness','close_with_family',
        'partner_close_with_family','is_draft','dynamic_answers','photo_storage_id','updatedAt',
      ])
      const safeParticipantData = Object.fromEntries(
        Object.entries(rest).filter(([k]) => allowedParticipantKeys.has(k))
      )

      // 1. Insert Participant
      // Coerce numeric fields that may come in as strings from the CSV
      const ageRaw = safeParticipantData.age ?? rest.age
      const age = ageRaw !== undefined && ageRaw !== '' ? Number(ageRaw) : undefined
      const preferred_partner_age_min = safeParticipantData.preferred_partner_age_min !== undefined
        ? Number(safeParticipantData.preferred_partner_age_min) : undefined
      const preferred_partner_age_max = safeParticipantData.preferred_partner_age_max !== undefined
        ? Number(safeParticipantData.preferred_partner_age_max) : undefined

      // Build a clean object — drop any key with undefined/null/empty-string value
      // so Convex doesn't reject unrecognized undefined fields
      const cleanParticipant: Record<string, unknown> = {
        full_name: String(safeParticipantData.full_name || rest.full_name || ''),
        contact_info: contactInfo,
        updatedAt: now,
      }
      const optionalFields: Array<[string, unknown]> = [
        ['gender', safeParticipantData.gender],
        ['age', isNaN(age as number) ? undefined : age],
        ['birthday', safeParticipantData.birthday],
        ['work', safeParticipantData.work],
        ['dream_city', safeParticipantData.dream_city],
        ['ask_out_preference', safeParticipantData.ask_out_preference],
        ['comfortable_with_man_asking_woman', safeParticipantData.comfortable_with_man_asking_woman],
        ['comfortable_with_alcohol_meetcute', safeParticipantData.comfortable_with_alcohol_meetcute],
        ['life_in_5_years', safeParticipantData.life_in_5_years],
        ['last_thing_that_made_you_laugh', safeParticipantData.last_thing_that_made_you_laugh],
        ['dream_date', safeParticipantData.dream_date],
        ['family_notes', safeParticipantData.family_notes],
        ['vice_or_red_flag', safeParticipantData.vice_or_red_flag],
        ['dealbreaker', specialData?.dealbreaker || safeParticipantData.dealbreaker],
        ['random_curiosities', safeParticipantData.random_curiosities],
        ['referral_notes', safeParticipantData.referral_notes],
        ['values_or_worldview', safeParticipantData.values_or_worldview],
        ['ready_for_love', safeParticipantData.ready_for_love],
        ['grand_amour', safeParticipantData.grand_amour],
        ['preferred_partner_age_min', isNaN(preferred_partner_age_min as number) ? undefined : preferred_partner_age_min],
        ['preferred_partner_age_max', isNaN(preferred_partner_age_max as number) ? undefined : preferred_partner_age_max],
        ['okay_with_some_deviation', safeParticipantData.okay_with_some_deviation],
        ['has_kids', safeParticipantData.has_kids],
        ['partner_has_kids', safeParticipantData.partner_has_kids],
        ['travels_world', safeParticipantData.travels_world],
        ['partner_travels_world', safeParticipantData.partner_travels_world],
        ['is_divorced', safeParticipantData.is_divorced],
        ['partner_is_divorced', safeParticipantData.partner_is_divorced],
        ['smokes_drug_friendly', safeParticipantData.smokes_drug_friendly],
        ['partner_smokes_drug_friendly', safeParticipantData.partner_smokes_drug_friendly],
        ['has_tattoos', safeParticipantData.has_tattoos],
        ['partner_has_tattoos', safeParticipantData.partner_has_tattoos],
        ['fitness_level', safeParticipantData.fitness_level],
        ['partner_fitness', safeParticipantData.partner_fitness],
        ['close_with_family', safeParticipantData.close_with_family],
        ['partner_close_with_family', safeParticipantData.partner_close_with_family],
        ['priority_weights', sanitizedWeights],
        ['dynamic_answers', Object.keys(dynamicAnswers).length > 0 ? dynamicAnswers : undefined],
      ]
      for (const [k, v] of optionalFields) {
        if (v !== undefined && v !== null && v !== '') {
          cleanParticipant[k] = v
        }
      }

      const participantId = await ctx.db.insert("participants", cleanParticipant as any);

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
