'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { UpdateApplicationStatusSchema } from '@/lib/schemas'

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
