'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { UpdateApplicationStatusSchema } from '@/lib/schemas'

export type ReviewState =
  | { error: string }
  | { success: true }
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
