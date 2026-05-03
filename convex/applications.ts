import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

// ─── Shared Types ─────────────────────────────────────────────

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

// ─── Internal helper ──────────────────────────────────────────

async function insertParticipantAndApplication(
  ctx: any,
  data: Record<string, unknown>
) {
  const now = Date.now()

  const participantId = await ctx.db.insert('participants', {
    full_name: data.full_name as string,
    contact_info: data.contact_info as string,
    gender: (data.gender as string) || undefined,
    age: (data.age as number) || undefined,
    birthday: (data.birthday as string) || undefined,
    work: (data.work as string) || undefined,
    dream_city: (data.dream_city as string) || undefined,
    ask_out_preference: (data.ask_out_preference as string) || undefined,
    comfortable_with_man_asking_woman:
      data.comfortable_with_man_asking_woman as boolean | undefined,
    comfortable_with_alcohol_meetcute:
      data.comfortable_with_alcohol_meetcute as boolean | undefined,
    life_in_5_years: (data.life_in_5_years as string) || undefined,
    last_thing_that_made_you_laugh:
      (data.last_thing_that_made_you_laugh as string) || undefined,
    dream_date: (data.dream_date as string) || undefined,
    family_notes: (data.family_notes as string) || undefined,
    vice_or_red_flag: (data.vice_or_red_flag as string) || undefined,
    dealbreaker: (data.dealbreaker as string) || undefined,
    random_curiosities: (data.random_curiosities as string) || undefined,
    referral_notes: (data.referral_notes as string) || undefined,
    values_or_worldview: (data.values_or_worldview as string) || undefined,
    priority_weights: data.priority_weights as
      | { pedigree: number; looks: number; personality: number }
      | undefined,
    ready_for_love: data.ready_for_love as 'yes' | 'not_sure' | 'no' | undefined,
    grand_amour: (data.grand_amour as string) || undefined,
    preferred_partner_age_min: data.preferred_partner_age_min as
      | number
      | undefined,
    preferred_partner_age_max: data.preferred_partner_age_max as
      | number
      | undefined,
    okay_with_some_deviation: data.okay_with_some_deviation as
      | boolean
      | undefined,
    has_kids: data.has_kids as 'want' | 'dont_want' | 'flexible' | undefined,
    partner_has_kids: data.partner_has_kids as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    travels_world: data.travels_world as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    partner_travels_world: data.partner_travels_world as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    is_divorced: data.is_divorced as 'want' | 'dont_want' | 'flexible' | undefined,
    partner_is_divorced: data.partner_is_divorced as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    smokes_drug_friendly: data.smokes_drug_friendly as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    partner_smokes_drug_friendly: data.partner_smokes_drug_friendly as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    has_tattoos: data.has_tattoos as 'want' | 'dont_want' | 'flexible' | undefined,
    partner_has_tattoos: data.partner_has_tattoos as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    fitness_level: data.fitness_level as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    partner_fitness: data.partner_fitness as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    close_with_family: data.close_with_family as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    partner_close_with_family: data.partner_close_with_family as
      | 'want'
      | 'dont_want'
      | 'flexible'
      | undefined,
    updatedAt: now,
  })

  await ctx.db.insert('applications', {
    participant_id: participantId,
    submitted_at: now,
    status: 'applied' as const,
    interview_required: false,
    interview_completed: false,
  })

  return participantId
}

// ─── Mutations ────────────────────────────────────────────────

/**
 * Public — submit a participant application from the public form.
 * No auth required.
 */
export const submitApplication = mutation({
  args: participantFields,
  handler: async (ctx, args) => {
    return await insertParticipantAndApplication(ctx, args)
  },
})

/**
 * Organizer-created participant (from the admin add-participant flow).
 * Requires auth.
 */
export const createOrganizerParticipant = mutation({
  args: participantFields,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    return await insertParticipantAndApplication(ctx, args)
  },
})
