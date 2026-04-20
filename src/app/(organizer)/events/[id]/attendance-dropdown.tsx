'use client'

import { useTransition } from 'react'
import { updateAttendanceStatus } from '@/app/actions/events'
import { ATTENDANCE_STATUS_LABELS } from '@/lib/constants'

interface AttendanceDropdownProps {
  eventId: string
  participantId: string
  initialStatus: string
}

export function AttendanceDropdown({ eventId, participantId, initialStatus }: AttendanceDropdownProps) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    startTransition(async () => {
      const res = await updateAttendanceStatus(eventId, participantId, newStatus)
      if (res?.error) {
        alert(res.error)
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
