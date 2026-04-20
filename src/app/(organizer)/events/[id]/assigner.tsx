'use client'

import { useActionState } from 'react'
import { assignParticipantToEvent } from '@/app/actions/events'

interface AssignerProps {
  eventId: string
  availableParticipants: { id: string; full_name: string; age: number; gender: string }[]
}

export function ParticipantAssigner({ eventId, availableParticipants }: AssignerProps) {
  const assignWithId = assignParticipantToEvent.bind(null, eventId)
  const [state, action, pending] = useActionState(assignWithId, undefined)

  if (availableParticipants.length === 0) {
    return (
      <div className="p-6 text-sm text-center" style={{ color: 'var(--muted)', background: 'var(--neutral-50)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        No approved participants available to assign.
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4 p-6" style={{ background: 'var(--neutral-50)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--neutral-900)' }}>
        Assign Participant
      </h3>
      
      {state && 'error' in state && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <select
          name="participant_id"
          required
          className="form-input text-sm w-full cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>Select an approved applicant...</option>
          {availableParticipants.map(p => (
            <option key={p.id} value={p.id}>
              {p.full_name} ({p.age}, {p.gender})
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-2 text-sm font-medium text-white transition-all disabled:opacity-60"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
      >
        {pending ? 'Assigning...' : 'Add to Roster'}
      </button>
    </form>
  )
}
