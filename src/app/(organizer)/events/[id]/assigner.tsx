'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

interface AssignerProps {
  eventId: Id<'events'>
  availableParticipants: { id: Id<'participants'>; full_name: string; age?: number; gender?: string }[]
}

export function ParticipantAssigner({ eventId, availableParticipants }: AssignerProps) {
  const assignParticipant = useMutation(api.events.assignParticipant)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (availableParticipants.length === 0) {
    return (
      <div className="p-6 text-sm text-center" style={{ color: 'var(--muted)', background: 'var(--neutral-50)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        No approved participants available to assign.
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const participantId = formData.get('participant_id') as string

    if (!participantId) {
      setPending(false)
      return
    }

    try {
      await assignParticipant({
        eventId,
        participantId: participantId as Id<'participants'>,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6" style={{ background: 'var(--neutral-50)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--neutral-900)' }}>
        Assign Participant
      </h3>
      
      {error && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {error}
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
        className="w-full rounded-xl py-2 text-sm font-medium text-white transition-all disabled:opacity-60 cursor-pointer"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
      >
        {pending ? 'Assigning...' : 'Add to Roster'}
      </button>
    </form>
  )
}
