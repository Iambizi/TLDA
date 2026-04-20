'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApplicationFormSchema } from '@/lib/schemas'

export type SubmitApplicationState =
  | { error: string }
  | { success: true }
  | undefined

export async function submitApplication(
  _prevState: SubmitApplicationState,
  formData: FormData
): Promise<SubmitApplicationState> {
  // Parse priority_weights from JSON string
  const rawData: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key === 'priority_weights') {
      try {
        rawData[key] = JSON.parse(value as string)
      } catch {
        rawData[key] = {}
      }
    } else if (value === 'true') {
      rawData[key] = true
    } else if (value === 'false') {
      rawData[key] = false
    } else if (value === '') {
      rawData[key] = undefined
    } else {
      rawData[key] = value
    }
  }

  // Coerce numeric fields
  if (rawData.age) rawData.age = Number(rawData.age)
  if (rawData.preferred_partner_age_min) rawData.preferred_partner_age_min = Number(rawData.preferred_partner_age_min)
  if (rawData.preferred_partner_age_max) rawData.preferred_partner_age_max = Number(rawData.preferred_partner_age_max)

  const parsed = ApplicationFormSchema.safeParse(rawData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { error: firstError?.message ?? 'Please check your answers and try again.' }
  }

  const data = parsed.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  // Insert participant (using `as any` to bypass Supabase generic inference issue with SSR client)
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .insert({
      full_name: data.full_name,
      contact_info: data.contact_info,
      gender: data.gender,
      age: data.age,
      birthday: data.birthday || null,
      work: data.work || null,
      dream_city: data.dream_city || null,
      ask_out_preference: data.ask_out_preference || null,
      comfortable_with_man_asking_woman: data.comfortable_with_man_asking_woman,
      comfortable_with_alcohol_meetcute: data.comfortable_with_alcohol_meetcute,
      life_in_5_years: data.life_in_5_years || null,
      last_thing_that_made_you_laugh: data.last_thing_that_made_you_laugh || null,
      dream_date: data.dream_date || null,
      family_notes: data.family_notes || null,
      vice_or_red_flag: data.vice_or_red_flag || null,
      dealbreaker: data.dealbreaker || null,
      random_curiosities: data.random_curiosities || null,
      referral_notes: data.referral_notes || null,
      values_or_worldview: data.values_or_worldview || null,
      priority_weights: data.priority_weights,
      ready_for_love: data.ready_for_love,
      grand_amour: data.grand_amour || null,
      preferred_partner_age_min: data.preferred_partner_age_min,
      preferred_partner_age_max: data.preferred_partner_age_max,
      okay_with_some_deviation: data.okay_with_some_deviation,
      has_kids: data.has_kids,
      partner_has_kids: data.partner_has_kids,
      travels_world: data.travels_world,
      partner_travels_world: data.partner_travels_world,
      is_divorced: data.is_divorced,
      partner_is_divorced: data.partner_is_divorced,
      smokes_drug_friendly: data.smokes_drug_friendly,
      partner_smokes_drug_friendly: data.partner_smokes_drug_friendly,
      has_tattoos: data.has_tattoos,
      partner_has_tattoos: data.partner_has_tattoos,
      fitness_level: data.fitness_level,
      partner_fitness: data.partner_fitness,
      close_with_family: data.close_with_family,
      partner_close_with_family: data.partner_close_with_family,
    })
    .select('id')
    .single()

  if (participantError || !participant) {
    console.error('Participant insert error:', participantError)
    return { error: 'Something went wrong saving your application. Please try again.' }
  }

  // Insert application record
  const { error: applicationError } = await supabase
    .from('applications')
    .insert({
      participant_id: participant.id,
      status: 'applied',
      interview_required: false,
      interview_completed: false,
      source_event_id: null,
      organizer_notes: null,
      tags: null,
      interview_date: null,
      assigned_event_id: null,
    })

  if (applicationError) {
    console.error('Application insert error:', applicationError)
    // Participant saved — don't block the user on this
  }

  redirect('/apply/success')
}
