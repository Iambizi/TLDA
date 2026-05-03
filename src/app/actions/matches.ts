'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateMatchOutcomeSchema } from '@/lib/schemas'

export type MatchState =
  | { error: string }
  | { success: true }
  | undefined

export async function logMatchOutcome(
  _prevState: MatchState,
  formData: FormData
): Promise<MatchState> {
  const connectionStatus = String(formData.get('connection_status') || 'connected')
  const followUpDate = String(formData.get('follow_up_date') || '')
  const notes = String(formData.get('organizer_notes') || '').trim()

  const statusMap: Record<string, string> = {
    connected: 'potential_match',
    exchanged_contacts: 'introduced_off_platform',
    went_on_date: 'mutual_interest',
    in_relationship: 'mutual_interest',
    no_follow_up: 'no_match',
  }

  const noteParts = [
    notes,
    `Connection status: ${connectionStatus.replaceAll('_', ' ')}`,
    followUpDate ? `Follow-up date: ${followUpDate}` : '',
  ].filter(Boolean)

  const rawData = {
    event_id: formData.get('event_id'),
    participant_a_id: formData.get('participant_a_id'),
    participant_b_id: formData.get('participant_b_id'),
    interest_status: statusMap[connectionStatus] || formData.get('interest_status') || 'potential_match',
    organizer_notes: noteParts.join('\n') || undefined,
  }

  const parsed = CreateMatchOutcomeSchema.safeParse(rawData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { error: firstError?.message ?? 'Invalid match data provided.' }
  }

  const data = parsed.data
  const supabase = await createClient() as any

  // To prevent duplicates, we can check if a match between these two already exists for this event
  const { data: existing } = await supabase
    .from('match_outcomes')
    .select('id')
    .eq('event_id', data.event_id)
    .or(`and(participant_a_id.eq.${data.participant_a_id},participant_b_id.eq.${data.participant_b_id}),and(participant_a_id.eq.${data.participant_b_id},participant_b_id.eq.${data.participant_a_id})`)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'A match outcome between these two participants is already logged for this event.' }
  }

  const { error: insertError } = await supabase
    .from('match_outcomes')
    .insert({
      event_id: data.event_id,
      participant_a_id: data.participant_a_id,
      participant_b_id: data.participant_b_id,
      interest_status: data.interest_status,
      organizer_notes: data.organizer_notes || null,
    })

  if (insertError) {
    console.error('Error logging match outcome:', insertError)
    return { error: 'Failed to log match outcome. Please try again.' }
  }

  revalidatePath(`/events/${data.event_id}/matches`)
  return { success: true }
}
