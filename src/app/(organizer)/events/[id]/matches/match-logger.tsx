'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import type { Id } from '../../../../../../convex/_generated/dataModel'

interface MatchLoggerProps {
  eventId: Id<'events'>
  participants: { id: Id<'participants'>; full_name: string }[]
}

const connectionStatuses = [
  { value: 'connected', label: 'Connected' },
  { value: 'exchanged_contacts', label: 'Exchanged Contacts' },
  { value: 'went_on_date', label: 'Went on a Date' },
  { value: 'in_relationship', label: 'In a Relationship' },
  { value: 'no_follow_up', label: 'No Follow-Up' },
]

export function MatchLogger({ eventId, participants }: MatchLoggerProps) {
  const logMatchOutcome = useMutation(api.matches.logMatchOutcome)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  if (participants.length < 2) {
    return (
      <div className="p-6 text-sm text-center" style={{ color: 'var(--muted)', background: 'var(--neutral-50)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        Add at least two participants to the event roster to start preliminary matching.
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const participant_a_id = formData.get('participant_a_id') as string
    const participant_b_id = formData.get('participant_b_id') as string
    const interest_status = formData.get('connection_status') as string
    const organizer_notes = formData.get('organizer_notes') as string

    try {
      await logMatchOutcome({
        event_id: eventId,
        participant_a_id: participant_a_id as Id<'participants'>,
        participant_b_id: participant_b_id as Id<'participants'>,
        interest_status: interest_status as any,
        organizer_notes: organizer_notes || undefined,
      })
      setSuccess(true)
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6" style={{ background: 'var(--neutral-50)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Preliminary Match
          </h3>
          <span
            title="Use this before or after an event to track pairings and follow-up outcomes."
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
          >
            i
          </span>
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
          Select two roster participants and track the outcome.
        </p>
      </div>

      {error && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          Match logged successfully.
        </div>
      )}

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
            {participants.map(p => (
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
            {participants.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="connection_status" className="text-xs font-medium" style={{ color: 'var(--neutral-700)' }}>
          Status
        </label>
        <select
          name="connection_status"
          id="connection_status"
          required
          className="form-input text-sm w-full cursor-pointer"
          defaultValue="connected"
        >
          {connectionStatuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="follow_up_date" className="text-xs font-medium" style={{ color: 'var(--neutral-700)' }}>
          Follow-Up Date
        </label>
        <input
          name="follow_up_date"
          id="follow_up_date"
          type="date"
          className="form-input text-sm w-full"
        />
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
        className="w-full rounded-xl py-2 text-sm font-medium text-white transition-all disabled:opacity-60 mt-2 cursor-pointer"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--neutral-900)' }}
      >
        {pending ? 'Saving...' : 'Save Match'}
      </button>
    </form>
  )
}
