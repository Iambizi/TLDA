import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

const lifestylePreference = v.union(
  v.literal('want'),
  v.literal('dont_want'),
  v.literal('flexible')
)

const readinessForLove = v.union(
  v.literal('yes'),
  v.literal('not_sure'),
  v.literal('no')
)

const participantFields = {
  full_name: v.string(),
  contact_info: v.string(),
  gender: v.optional(v.string()),
  age: v.optional(v.number()),
  birthday: v.optional(v.string()),
  work: v.optional(v.string()),
  dream_city: v.optional(v.string()),
  ask_out_preference: v.optional(v.string()),
  comfortable_with_man_asking_woman: v.optional(v.boolean()),
  comfortable_with_alcohol_meetcute: v.optional(v.boolean()),
  life_in_5_years: v.optional(v.string()),
  last_thing_that_made_you_laugh: v.optional(v.string()),
  dream_date: v.optional(v.string()),
  family_notes: v.optional(v.string()),
  vice_or_red_flag: v.optional(v.string()),
  dealbreaker: v.optional(v.string()),
  random_curiosities: v.optional(v.string()),
  referral_notes: v.optional(v.string()),
  values_or_worldview: v.optional(v.string()),
  priority_weights: v.optional(
    v.object({
      pedigree: v.number(),
      looks: v.number(),
      personality: v.number(),
    })
  ),
  ready_for_love: v.optional(readinessForLove),
  grand_amour: v.optional(v.string()),
  preferred_partner_age_min: v.optional(v.number()),
  preferred_partner_age_max: v.optional(v.number()),
  okay_with_some_deviation: v.optional(v.boolean()),
  has_kids: v.optional(lifestylePreference),
  partner_has_kids: v.optional(lifestylePreference),
  travels_world: v.optional(lifestylePreference),
  partner_travels_world: v.optional(lifestylePreference),
  is_divorced: v.optional(lifestylePreference),
  partner_is_divorced: v.optional(lifestylePreference),
  smokes_drug_friendly: v.optional(lifestylePreference),
  partner_smokes_drug_friendly: v.optional(lifestylePreference),
  has_tattoos: v.optional(lifestylePreference),
  partner_has_tattoos: v.optional(lifestylePreference),
  fitness_level: v.optional(lifestylePreference),
  partner_fitness: v.optional(lifestylePreference),
  close_with_family: v.optional(lifestylePreference),
  partner_close_with_family: v.optional(lifestylePreference),
}

export const importParticipants = mutation({
  args: {
    participants: v.array(v.object(participantFields)),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const now = Date.now()

    for (const data of args.participants) {
      const participantId = await ctx.db.insert('participants', {
        ...data,
        updatedAt: now,
      })

      await ctx.db.insert('applications', {
        participant_id: participantId,
        submitted_at: now,
        status: 'applied',
        interview_required: false,
        interview_completed: false,
      })
    }

    return { count: args.participants.length }
  },
})
