'use server'

import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ApplicationFormSchema, type ApplicationFormValues } from '@/lib/schemas'

export type ApplicationSubmissionState =
  | { error: string }
  | { success: true }
  | undefined

function parseApplicationFormData(formData: FormData) {
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

  return ApplicationFormSchema.safeParse(rawData)
}

async function createParticipantAndApplication(
  data: ApplicationFormValues,
  options?: { strictApplicationInsert?: boolean }
): Promise<
  | { error: string }
  | { participantId: string; applicationError: unknown | null }
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any
  const participantId = randomUUID()

  const { error: participantError } = await supabase
    .from('participants')
    .insert({
      id: participantId,
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

  if (participantError) {
    console.error('Participant insert error:', participantError)
    return { error: 'Something went wrong saving the participant. Please try again.' }
  }

  const { error: applicationError } = await supabase
    .from('applications')
    .insert({
      participant_id: participantId,
      status: 'applied',
      interview_required: false,
      interview_completed: false,
      source_event_id: null,
      organizer_notes: null,
      tags: null,
      interview_date: null,
      assigned_event_id: null,
    })

  if (applicationError && options?.strictApplicationInsert) {
    console.error('Application insert error after participant insert:', applicationError)

    const { error: cleanupError } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId)

    if (cleanupError) {
      console.error('Participant rollback error:', cleanupError)
    }

    return { error: 'The participant could not be added completely. Please try again.' }
  }

  return { participantId, applicationError }
}

export async function submitApplication(
  _prevState: ApplicationSubmissionState,
  formData: FormData
): Promise<ApplicationSubmissionState> {
  const parsed = parseApplicationFormData(formData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { error: firstError?.message ?? 'Please check your answers and try again.' }
  }

  const result = await createParticipantAndApplication(parsed.data)

  if ('error' in result) {
    return { error: result.error }
  }

  if (result.applicationError) {
    console.error('Application insert error:', result.applicationError)
  }

  redirect('/apply/success')
}

export async function createOrganizerParticipant(
  _prevState: ApplicationSubmissionState,
  formData: FormData
): Promise<ApplicationSubmissionState> {
  const parsed = parseApplicationFormData(formData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { error: firstError?.message ?? 'Please check the participant details and try again.' }
  }

  const result = await createParticipantAndApplication(parsed.data, {
    strictApplicationInsert: true,
  })

  if ('error' in result) {
    return { error: result.error }
  }

  revalidatePath('/dashboard')
  revalidatePath('/participants')

  redirect(`/participants/${result.participantId}`)
}
