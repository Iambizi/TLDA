'use client'

import { useActionState, useEffect } from 'react'
import { updateApplicationReview } from '@/app/actions/participants'
import { APPLICATION_STATUS_LABELS } from '@/lib/constants'

interface ReviewFormProps {
  applicationId: string
  initialStatus: string
  initialNotes: string | null
}

export function ReviewForm({ applicationId, initialStatus, initialNotes }: ReviewFormProps) {
  const updateWithId = updateApplicationReview.bind(null, applicationId)
  const [state, action, pending] = useActionState(updateWithId, undefined)

  return (
    <form action={action} className="flex flex-col gap-5">
      {state && 'error' in state && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {state.error}
        </div>
      )}
      {state && 'success' in state && (
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
        className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
      >
        {pending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
