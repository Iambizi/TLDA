'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateEventSchema } from '@/lib/schemas'

export type CreateEventState =
  | { error: string }
  | { success: true; eventId: string }
  | undefined

export async function createEvent(
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const optionalString = (key: string) => {
    const value = formData.get(key)
    return typeof value === 'string' && value.trim() !== '' ? value : undefined
  }

  const rawData = {
    title: formData.get('title'),
    event_date: optionalString('event_date'),
    location: optionalString('location'),
    description: optionalString('description'),
    status: formData.get('status') || 'draft',
    notes: optionalString('notes'),
  }

  const parsed = CreateEventSchema.safeParse(rawData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { error: firstError?.message ?? 'Invalid event data provided.' }
  }

  const data = parsed.data
  const supabase = await createClient() as any

  // Format date if present (convert from local input string to ISO if necessary)
  let isoDate = null
  if (data.event_date) {
    isoDate = new Date(data.event_date).toISOString()
  }

  const { data: newEvent, error } = await supabase
    .from('events')
    .insert({
      title: data.title,
      event_date: isoDate,
      location: data.location || null,
      description: data.description || null,
      status: data.status,
      notes: data.notes || null,
    })
    .select('id')
    .single()

  if (error || !newEvent) {
    console.error('Error creating event:', error)
    return { error: 'Failed to create event. Please try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/events')
  
  redirect(`/events/${newEvent.id}`)
}

export type AssignState = { error: string } | { success: true } | undefined

export async function assignParticipantToEvent(
  eventId: string,
  _prevState: AssignState,
  formData: FormData
): Promise<AssignState> {
  const participantId = formData.get('participant_id') as string
  if (!participantId) return { error: 'Participant ID is required.' }

  const supabase = await createClient() as any

  // 1. Get the participant's most recent application to link it
  const { data: apps } = await supabase
    .from('applications')
    .select('id')
    .eq('participant_id', participantId)
    .order('submitted_at', { ascending: false })
    .limit(1)

  const applicationId = apps?.[0]?.id || null

  // 2. Insert into event_participants
  const { error: insertError } = await supabase
    .from('event_participants')
    .insert({
      event_id: eventId,
      participant_id: participantId,
      application_id: applicationId,
      attendance_status: 'invited',
    })

  if (insertError) {
    // Handle unique constraint violation (already assigned)
    if (insertError.code === '23505') {
      return { error: 'Participant is already assigned to this event.' }
    }
    console.error('Error assigning participant:', insertError)
    return { error: 'Failed to assign participant.' }
  }

  // 3. Update global application status to 'assigned_to_event'
  if (applicationId) {
    await supabase
      .from('applications')
      .update({ status: 'assigned_to_event' })
      .eq('id', applicationId)
  }

  revalidatePath(`/events/${eventId}`)
  revalidatePath(`/participants`)
  return { success: true }
}

export async function removeParticipantFromEvent(
  eventId: string,
  participantId: string
) {
  const supabase = await createClient() as any

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('participant_id', participantId)

  if (error) {
    console.error('Error removing participant:', error)
    return { error: 'Failed to remove participant.' }
  }

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

export async function updateAttendanceStatus(
  eventId: string,
  participantId: string,
  status: string
) {
  const supabase = await createClient() as any

  const { error } = await supabase
    .from('event_participants')
    .update({ attendance_status: status })
    .eq('event_id', eventId)
    .eq('participant_id', participantId)

  if (error) {
    console.error('Error updating attendance status:', error)
    return { error: 'Failed to update attendance status.' }
  }

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

