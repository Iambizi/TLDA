'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

interface RemoveParticipantButtonProps {
  eventId: Id<'events'>
  participantId: Id<'participants'>
}

export function RemoveParticipantButton({ eventId, participantId }: RemoveParticipantButtonProps) {
  const removeParticipant = useMutation(api.events.removeParticipant)
  const [isPending, setIsPending] = useState(false)

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this participant from the roster?')) return
    
    setIsPending(true)
    try {
      await removeParticipant({ eventId, participantId })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors cursor-pointer"
    >
      {isPending ? 'Removing...' : 'Remove'}
    </button>
  )
}
