'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateInterviewSchema } from '@/lib/schemas'

export type InterviewState =
  | { error: string }
  | { success: true }
  | undefined

export async function logInterview(
  _prevState: InterviewState,
  formData: FormData
): Promise<InterviewState> {
  const participantId = formData.get('participant_id') as string
  const applicationId = formData.get('application_id') as string

  const rawData = {
    participant_id: participantId,
    application_id: applicationId,
    scheduled_at: formData.get('scheduled_at') || null,
    outcome: formData.get('outcome') || 'pending',
    notes: formData.get('notes') || null,
  }

  const parsed = CreateInterviewSchema.safeParse(rawData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { error: firstError?.message ?? 'Invalid interview data provided.' }
  }

  const data = parsed.data
  const supabase = await createClient() as any

  let isoDate = null
  if (data.scheduled_at) {
    isoDate = new Date(data.scheduled_at).toISOString()
  }

  // 1. Insert interview record
  const { error: insertError } = await supabase
    .from('interviews')
    .insert({
      participant_id: data.participant_id,
      application_id: data.application_id,
      scheduled_at: isoDate,
      outcome: data.outcome,
      notes: data.notes || null,
    })

  if (insertError) {
    console.error('Error logging interview:', insertError)
    return { error: 'Failed to log interview. Please try again.' }
  }

  // 2. Sync application table fields
  await supabase
    .from('applications')
    .update({
      interview_completed: data.outcome === 'completed',
      interview_date: isoDate,
    })
    .eq('id', data.application_id)

  revalidatePath(`/participants/${data.participant_id}`)
  return { success: true }
}
