'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import { INTERVIEW_OUTCOME_LABELS } from '@/lib/constants'

interface InterviewLoggerProps {
  participantId: Id<'participants'>
  applicationId: Id<'applications'>
}

export function InterviewLogger({ participantId, applicationId }: InterviewLoggerProps) {
  const logInterview = useMutation(api.interviews.logInterview)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    const scheduled_at = formData.get('scheduled_at') as string
    const outcome = formData.get('outcome') as string
    const notes = formData.get('notes') as string

    try {
      await logInterview({
        participant_id: participantId,
        application_id: applicationId,
        scheduled_at: scheduled_at ? new Date(scheduled_at).getTime() : undefined,
        outcome: outcome as any,
        notes: notes || undefined,
      })
      setSuccess(true)
      // reset form optionally
      event.currentTarget.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          Interview logged successfully.
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="scheduled_at" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
          Date & Time
        </label>
        <input
          id="scheduled_at"
          name="scheduled_at"
          type="datetime-local"
          className="form-input text-sm w-full"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="outcome" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
          Outcome
        </label>
        <select
          id="outcome"
          name="outcome"
          defaultValue="pending"
          className="form-input text-sm w-full cursor-pointer"
        >
          {Object.entries(INTERVIEW_OUTCOME_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
          Interview Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Private notes from the call..."
          className="form-input text-sm w-full resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-2 text-sm font-medium text-white transition-all disabled:opacity-60 mt-2 cursor-pointer"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--neutral-900)' }}
      >
        {pending ? 'Saving...' : 'Log Interview'}
      </button>
    </form>
  )
}
