'use client'

import { useTransition } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import { ATTENDANCE_STATUS_LABELS } from '@/lib/constants'

interface AttendanceDropdownProps {
  eventId: Id<'events'>
  participantId: Id<'participants'>
  initialStatus: string
}

export function AttendanceDropdown({ eventId, participantId, initialStatus }: AttendanceDropdownProps) {
  const updateAttendance = useMutation(api.events.updateAttendanceStatus)
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    startTransition(async () => {
      try {
        await updateAttendance({
          eventId,
          participantId,
          status: newStatus as any
        })
      } catch (err: any) {
        alert(err.message)
      }
    })
  }

  return (
    <select
      value={initialStatus}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs font-medium rounded-md border px-2 py-1 outline-none cursor-pointer transition-colors disabled:opacity-50"
      style={{
        background: 'var(--neutral-50)',
        borderColor: 'var(--border)',
        color: 'var(--neutral-800)',
      }}
    >
      {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}
