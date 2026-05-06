'use client'

import { notFound, useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import type { Id } from '../../../../../../convex/_generated/dataModel'
import { EVENT_STATUS_LABELS } from '@/lib/constants'
import { useState, type FormEvent } from 'react'

export default function EditEventPage() {
  const params = useParams<{ id: Id<'events'> }>()
  const id = params?.id
  const router = useRouter()

  const data = useQuery(api.events.getById, id ? { id } : 'skip')
  const updateEvent = useMutation(api.events.updateEvent)

  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (data === undefined) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>Loading...</div>
  }

  if (data === null) {
    notFound()
  }

  const { ...event } = data

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)

    try {
      await updateEvent({
        id: event._id,
        title: formData.get('title') as string,
        location: (formData.get('location') as string) || undefined,
        description: (formData.get('description') as string) || undefined,
        event_date: formData.get('event_date') ? new Date(formData.get('event_date') as string).getTime() : undefined,
        status: (formData.get('status') as 'draft' | 'open' | 'closed' | 'completed' | 'archived') || undefined,
        notes: (formData.get('notes') as string) || undefined,
      })
      router.push(`/events/${id}`)
    } catch (err: any) {
      setError(err.message)
      setPending(false)
    }
  }

  const eventDateValue = event.event_date
    ? new Date(event.event_date).toISOString().slice(0, 16)
    : ''

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/events/${id}`} className="text-sm font-medium hover:underline" style={{ color: 'var(--neutral-500)' }}>
          ← Back to event
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
          Edit Event
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Update event details and notes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border p-8 shadow-sm flex flex-col gap-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Title *</label>
          <input id="title" name="title" type="text" required defaultValue={event.title} className="form-input" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="event_date" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Date & Time</label>
            <input id="event_date" name="event_date" type="datetime-local" defaultValue={eventDateValue} className="form-input" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Status</label>
            <select id="status" name="status" defaultValue={event.status} className="form-input">
              {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Location</label>
          <input id="location" name="location" type="text" defaultValue={event.location ?? ''} className="form-input" placeholder="Venue name and address" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Description</label>
          <textarea id="description" name="description" rows={3} defaultValue={event.description ?? ''} className="form-input resize-none" placeholder="Optional event description" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Organizer Notes</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={event.notes ?? ''} className="form-input resize-none" placeholder="Internal notes, reminders, observations..." />
        </div>

        <div className="flex justify-end gap-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <Link href={`/events/${id}`} className="rounded-xl border px-5 py-2.5 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--neutral-600)' }}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
          >
            {pending ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
