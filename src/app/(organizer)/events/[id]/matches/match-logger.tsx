'use client'

import { useActionState } from 'react'
import { logMatchOutcome } from '@/app/actions/matches'
import { INTEREST_STATUS_LABELS } from '@/lib/constants'

interface MatchLoggerProps {
  eventId: string
  attendedParticipants: { id: string; full_name: string }[]
}

export function MatchLogger({ eventId, attendedParticipants }: MatchLoggerProps) {
  const [state, action, pending] = useActionState(logMatchOutcome, undefined)

  if (attendedParticipants.length < 2) {
    return (
      <div className="p-6 text-sm text-center" style={{ color: 'var(--muted)', background: 'var(--neutral-50)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        Not enough attendees logged yet to record matches. Update the event roster attendance statuses to 'Attended'.
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4 p-6" style={{ background: 'var(--neutral-50)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--neutral-900)' }}>
        Log New Match
      </h3>
      
      {state && 'error' in state && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {state.error}
        </div>
      )}
      {state && 'success' in state && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          Match logged successfully.
        </div>
      )}

      <input type="hidden" name="event_id" value={eventId} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="participant_a_id" className="text-xs font-medium" style={{ color: 'var(--neutral-700)' }}>
            Participant A
          </label>
          <select
            name="participant_a_id"
            id="participant_a_id"
            required
            className="form-input text-sm w-full cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Select participant...</option>
            {attendedParticipants.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="participant_b_id" className="text-xs font-medium" style={{ color: 'var(--neutral-700)' }}>
            Participant B
          </label>
          <select
            name="participant_b_id"
            id="participant_b_id"
            required
            className="form-input text-sm w-full cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Select participant...</option>
            {attendedParticipants.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="interest_status" className="text-xs font-medium" style={{ color: 'var(--neutral-700)' }}>
          Interest Level
        </label>
        <select
          name="interest_status"
          id="interest_status"
          required
          className="form-input text-sm w-full cursor-pointer"
          defaultValue="mutual_interest"
        >
          {Object.entries(INTEREST_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="organizer_notes" className="text-xs font-medium" style={{ color: 'var(--neutral-700)' }}>
          Notes (Optional)
        </label>
        <textarea
          name="organizer_notes"
          id="organizer_notes"
          rows={2}
          className="form-input text-sm w-full resize-y"
          placeholder="e.g. They hit it off instantly..."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-2 text-sm font-medium text-white transition-all disabled:opacity-60 mt-2"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--neutral-900)' }}
      >
        {pending ? 'Saving...' : 'Log Match Outcome'}
      </button>
    </form>
  )
}
