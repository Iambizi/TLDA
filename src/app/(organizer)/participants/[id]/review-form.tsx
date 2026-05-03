'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import { APPLICATION_STATUS_LABELS } from '@/lib/constants'

interface ReviewFormProps {
  applicationId: Id<'applications'>
  initialStatus: string
  initialNotes: string | null | undefined
}

export function ReviewForm({ applicationId, initialStatus, initialNotes }: ReviewFormProps) {
  const updateApplication = useMutation(api.participants.updateApplicationReview)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    const status = formData.get('status') as string
    const organizer_notes = formData.get('organizer_notes') as string

    try {
      await updateApplication({ 
        applicationId, 
        status: status as any, 
        organizer_notes: organizer_notes || undefined 
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          Application updated successfully.
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
          Application Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={initialStatus}
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--neutral-900)', background: 'var(--neutral-50)' }}
        >
          {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="organizer_notes" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
          Organizer Notes
        </label>
        <textarea
          id="organizer_notes"
          name="organizer_notes"
          defaultValue={initialNotes || ''}
          rows={6}
          placeholder="Internal notes about this applicant..."
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all resize-y"
          style={{ borderColor: 'var(--border)', color: 'var(--neutral-900)', background: 'var(--neutral-50)' }}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60 cursor-pointer"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
      >
        {pending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
