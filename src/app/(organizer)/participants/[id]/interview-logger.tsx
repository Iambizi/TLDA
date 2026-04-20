'use client'

import { useActionState } from 'react'
import { logInterview } from '@/app/actions/interviews'
import { INTERVIEW_OUTCOME_LABELS } from '@/lib/constants'

interface InterviewLoggerProps {
  participantId: string
  applicationId: string
}

export function InterviewLogger({ participantId, applicationId }: InterviewLoggerProps) {
  const [state, action, pending] = useActionState(logInterview, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state && 'error' in state && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {state.error}
        </div>
      )}
      {state && 'success' in state && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          Interview logged successfully.
        </div>
      )}

      <input type="hidden" name="participant_id" value={participantId} />
      <input type="hidden" name="application_id" value={applicationId} />

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
        className="w-full rounded-xl py-2 text-sm font-medium text-white transition-all disabled:opacity-60 mt-2"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--neutral-900)' }}
      >
        {pending ? 'Saving...' : 'Log Interview'}
      </button>
    </form>
  )
}
