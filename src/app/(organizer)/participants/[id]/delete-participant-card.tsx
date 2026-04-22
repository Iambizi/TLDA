'use client'

import { useActionState } from 'react'
import { deleteParticipant } from '@/app/actions/participants'

interface DeleteParticipantCardProps {
  participantId: string
  participantName: string
}

export function DeleteParticipantCard({ participantId, participantName }: DeleteParticipantCardProps) {
  const deleteWithId = deleteParticipant.bind(null, participantId)
  const [state, action, pending] = useActionState(deleteWithId, undefined)

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${participantName} and all related applications, interviews, roster assignments, and match logs? This cannot be undone.`
        )

        if (!confirmed) {
          event.preventDefault()
        }
      }}
      className="rounded-2xl border p-6 shadow-sm bg-white"
      style={{ borderColor: '#fecaca' }}
    >
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#991b1b' }}>
        Danger Zone
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--neutral-600)' }}>
        This permanently deletes the participant record and all related organizer data.
      </p>

      {state && 'error' in state && (
        <div
          className="rounded-lg px-4 py-3 text-sm mb-4"
          style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
          role="alert"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60"
        style={{ background: pending ? '#fca5a5' : '#dc2626' }}
      >
        {pending ? 'Deleting...' : 'Delete Participant'}
      </button>
    </form>
  )
}
