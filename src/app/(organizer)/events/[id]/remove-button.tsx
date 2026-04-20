'use client'

import { useState } from 'react'
import { removeParticipantFromEvent } from '@/app/actions/events'

interface RemoveParticipantButtonProps {
  eventId: string
  participantId: string
}

export function RemoveParticipantButton({ eventId, participantId }: RemoveParticipantButtonProps) {
  const [isPending, setIsPending] = useState(false)

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this participant from the roster?')) return
    
    setIsPending(true)
    const res = await removeParticipantFromEvent(eventId, participantId)
    if (res?.error) {
      alert(res.error)
    }
    setIsPending(false)
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
    >
      {isPending ? 'Removing...' : 'Remove'}
    </button>
  )
}
