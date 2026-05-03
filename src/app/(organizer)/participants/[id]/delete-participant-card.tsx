'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

interface DeleteParticipantCardProps {
  participantId: Id<'participants'>
  participantName: string
}

export function DeleteParticipantCard({ participantId, participantName }: DeleteParticipantCardProps) {
  const deleteParticipant = useMutation(api.participants.deleteParticipant)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    const confirmed = window.confirm(
      `Delete ${participantName} and all related applications, interviews, roster assignments, and match logs? This cannot be undone.`
    )

    if (!confirmed) return

    setPending(true)
    setError(null)

    try {
      await deleteParticipant({ participantId })
      router.push('/participants')
    } catch (err: any) {
      setError(err.message)
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-6 shadow-sm bg-white"
      style={{ borderColor: '#fecaca' }}
    >
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#991b1b' }}>
        Danger Zone
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--neutral-600)' }}>
        This permanently deletes the participant record and all related organizer data.
      </p>

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm mb-4"
          style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60 cursor-pointer"
        style={{ background: pending ? '#fca5a5' : '#dc2626' }}
      >
        {pending ? 'Deleting...' : 'Delete Participant'}
      </button>
    </form>
  )
}
