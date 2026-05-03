'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { EVENT_STATUS_LABELS } from '@/lib/constants'

export default function CreateEventPage() {
  const createEvent = useMutation(api.events.createEvent)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const title = formData.get('title') as string
    const event_date = formData.get('event_date') as string
    const status = formData.get('status') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string
    const notes = formData.get('notes') as string

    try {
      const newEventId = await createEvent({
        title,
        event_date: event_date ? new Date(event_date).getTime() : undefined,
        status: status as any,
        location: location || undefined,
        description: description || undefined,
        notes: notes || undefined,
      })
      router.push(`/events/${newEventId}`)
    } catch (err: any) {
      setError(err.message)
      setPending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/events"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--neutral-500)' }}
        >
          ← Back to events
        </Link>
      </div>

      <div className="rounded-2xl border p-8 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Create New Event
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Set up the details for your next gathering. You can build the roster later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
              Event Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Summer Mix & Mingle"
              className="form-input w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="event_date" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
                Date & Time
              </label>
              <input
                id="event_date"
                name="event_date"
                type="datetime-local"
                className="form-input w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="draft"
                className="form-input w-full cursor-pointer"
              >
                {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. The Bowery Hotel, NYC"
              className="form-input w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Public or internal details about the event vibe..."
              className="form-input w-full resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="notes" className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
              Internal Organizer Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Logistics, capacity limits, or VIPs to invite..."
              className="form-input w-full resize-y"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-4">
            <Link
              href="/events"
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--neutral-600)' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60 cursor-pointer"
              style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
            >
              {pending ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
