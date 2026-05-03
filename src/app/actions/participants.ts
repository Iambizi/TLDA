'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ApplicationFormSchema, UpdateApplicationStatusSchema } from '@/lib/schemas'

export type ReviewState =
  | { error: string }
  | { success: true }
  | undefined

export type DeleteParticipantState =
  | { error: string }
  | undefined

export async function updateApplicationReview(
  applicationId: string,
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const rawStatus = formData.get('status')
  const rawNotes = formData.get('organizer_notes')

  const parsed = UpdateApplicationStatusSchema.safeParse({
    status: rawStatus,
    organizer_notes: rawNotes,
  })

  if (!parsed.success) {
    return { error: 'Invalid data provided.' }
  }

  const { status, organizer_notes } = parsed.data
  const supabase = await createClient() as any

  const { error } = await supabase
    .from('applications')
    .update({
      status,
      organizer_notes: organizer_notes || null,
    })
    .eq('id', applicationId)

  if (error) {
    console.error('Error updating application review:', error)
    return { error: 'Failed to update application. Please try again.' }
  }

  // Find the participant ID to revalidate the correct path
  const { data: application } = await supabase
    .from('applications')
    .select('participant_id')
    .eq('id', applicationId)
    .single()

  if (application?.participant_id) {
    revalidatePath(`/participants/${application.participant_id}`)
  }
  revalidatePath('/dashboard')
  revalidatePath('/participants')

  return { success: true }
}

export async function deleteParticipant(
  participantId: string,
  _prevState: DeleteParticipantState,
  _formData: FormData
): Promise<DeleteParticipantState> {
  void _prevState
  void _formData

  const supabase = await createClient() as any

  const [{ data: rosterRows, error: rosterError }, { data: matchRows, error: matchError }] = await Promise.all([
    supabase
      .from('event_participants')
      .select('event_id')
      .eq('participant_id', participantId),
    supabase
      .from('match_outcomes')
      .select('event_id')
      .or(`participant_a_id.eq.${participantId},participant_b_id.eq.${participantId}`),
  ])

  if (rosterError || matchError) {
    console.error('Error looking up participant dependencies:', rosterError || matchError)
    return { error: 'Failed to prepare participant deletion. Please try again.' }
  }

  const eventIdsToRevalidate = new Set<string>([
    ...(rosterRows || []).map((row: { event_id: string }) => row.event_id),
    ...(matchRows || []).map((row: { event_id: string }) => row.event_id),
  ])

  const { error: matchDeleteError } = await supabase
    .from('match_outcomes')
    .delete()
    .or(`participant_a_id.eq.${participantId},participant_b_id.eq.${participantId}`)

  if (matchDeleteError) {
    console.error('Error deleting participant match outcomes:', matchDeleteError)
    return { error: 'Failed to delete participant match history.' }
  }

  const { error: rosterDeleteError } = await supabase
    .from('event_participants')
    .delete()
    .eq('participant_id', participantId)

  if (rosterDeleteError) {
    console.error('Error deleting participant roster entries:', rosterDeleteError)
    return { error: 'Failed to remove participant from event rosters.' }
  }

  const { error: interviewDeleteError } = await supabase
    .from('interviews')
    .delete()
    .eq('participant_id', participantId)

  if (interviewDeleteError) {
    console.error('Error deleting participant interviews:', interviewDeleteError)
    return { error: 'Failed to delete participant interviews.' }
  }

  const { error: applicationDeleteError } = await supabase
    .from('applications')
    .delete()
    .eq('participant_id', participantId)

  if (applicationDeleteError) {
    console.error('Error deleting participant applications:', applicationDeleteError)
    return { error: 'Failed to delete participant applications.' }
  }

  const { error: participantDeleteError } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId)

  if (participantDeleteError) {
    console.error('Error deleting participant:', participantDeleteError)
    return { error: 'Failed to delete participant.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/participants')
  for (const eventId of eventIdsToRevalidate) {
    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/events/${eventId}/matches`)
  }

  redirect('/participants')
}

export async function updateParticipantProfile(
  participantId: string,
  formData: FormData
): Promise<void> {
  const priorityWeights = {
    pedigree: Number(formData.get('priority_pedigree') || 0),
    looks: Number(formData.get('priority_looks') || 0),
    personality: Number(formData.get('priority_personality') || 0),
  }

  const rawData = {
    full_name: formData.get('full_name'),
    contact_info: formData.get('contact_info'),
    gender: formData.get('gender'),
    age: Number(formData.get('age') || 0),
    birthday: formData.get('birthday'),
    work: formData.get('work'),
    dream_city: formData.get('dream_city') || undefined,
    ask_out_preference: formData.get('ask_out_preference') || undefined,
    comfortable_with_man_asking_woman: formData.get('comfortable_with_man_asking_woman') === 'on',
    comfortable_with_alcohol_meetcute: formData.get('comfortable_with_alcohol_meetcute') === 'on',
    life_in_5_years: formData.get('life_in_5_years') || undefined,
    last_thing_that_made_you_laugh: formData.get('last_thing_that_made_you_laugh') || undefined,
    dream_date: formData.get('dream_date') || undefined,
    family_notes: formData.get('family_notes') || undefined,
    vice_or_red_flag: formData.get('vice_or_red_flag') || undefined,
    dealbreaker: formData.get('dealbreaker') || undefined,
    random_curiosities: formData.get('random_curiosities') || undefined,
    referral_notes: formData.get('referral_notes') || undefined,
    values_or_worldview: formData.get('values_or_worldview') || undefined,
    priority_weights: priorityWeights,
    ready_for_love: formData.get('ready_for_love') || undefined,
    grand_amour: formData.get('grand_amour') || undefined,
    preferred_partner_age_min: formData.get('preferred_partner_age_min') ? Number(formData.get('preferred_partner_age_min')) : undefined,
    preferred_partner_age_max: formData.get('preferred_partner_age_max') ? Number(formData.get('preferred_partner_age_max')) : undefined,
    okay_with_some_deviation: formData.get('okay_with_some_deviation') === 'on',
    has_kids: formData.get('has_kids') || undefined,
    partner_has_kids: formData.get('partner_has_kids') || undefined,
    travels_world: formData.get('travels_world') || undefined,
    partner_travels_world: formData.get('partner_travels_world') || undefined,
    is_divorced: formData.get('is_divorced') || undefined,
    partner_is_divorced: formData.get('partner_is_divorced') || undefined,
    smokes_drug_friendly: formData.get('smokes_drug_friendly') || undefined,
    partner_smokes_drug_friendly: formData.get('partner_smokes_drug_friendly') || undefined,
    has_tattoos: formData.get('has_tattoos') || undefined,
    partner_has_tattoos: formData.get('partner_has_tattoos') || undefined,
    fitness_level: formData.get('fitness_level') || undefined,
    partner_fitness: formData.get('partner_fitness') || undefined,
    close_with_family: formData.get('close_with_family') || undefined,
    partner_close_with_family: formData.get('partner_close_with_family') || undefined,
  }

  const parsed = ApplicationFormSchema.safeParse(rawData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    throw new Error(firstError?.message ?? 'Please check the profile and try again.')
  }

  const data = parsed.data
  const supabase = await createClient() as any

  const { error } = await supabase
    .from('participants')
    .update({
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
    .eq('id', participantId)

  if (error) {
    console.error('Error updating participant profile:', error)
    throw new Error('Failed to update participant profile. Please try again.')
  }

  revalidatePath('/participants')
  revalidatePath(`/participants/${participantId}`)

  redirect(`/participants/${participantId}`)
}
