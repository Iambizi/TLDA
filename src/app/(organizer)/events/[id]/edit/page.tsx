import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EVENT_STATUS_LABELS } from '@/lib/constants'
import { updateEvent } from '@/app/actions/events'

export const metadata: Metadata = { title: 'Edit Event' }

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

function datetimeLocal(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()

  if (!event) {
    notFound()
  }

  const action = updateEvent.bind(null, id)

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href={`/events/${id}`} className="text-sm font-medium hover:underline" style={{ color: 'var(--neutral-500)' }}>
          ← Back to event
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--neutral-900)' }}>Edit Event</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Update date, location, notes, and event details.</p>
      </div>

      <form action={action} className="rounded-2xl border p-8 shadow-sm flex flex-col gap-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Title</span>
          <input name="title" required defaultValue={event.title} className="form-input" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Date</span>
          <input name="event_date" type="datetime-local" defaultValue={datetimeLocal(event.event_date)} className="form-input" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Location</span>
          <input name="location" defaultValue={event.location ?? ''} className="form-input" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Status</span>
          <select name="status" defaultValue={event.status} className="form-input">
            {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Description</span>
          <textarea name="description" rows={3} defaultValue={event.description ?? ''} className="form-input resize-y" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Meeting Notes</span>
          <textarea name="notes" rows={5} defaultValue={event.notes ?? ''} className="form-input resize-y" />
        </label>

        <div className="rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--neutral-50)' }}>
          Event photo upload will be enabled after the v3 storage migration adds `events.photo_url`.
        </div>

        <div className="flex justify-end gap-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <Link href={`/events/${id}`} className="rounded-xl border px-5 py-2.5 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--neutral-600)' }}>Cancel</Link>
          <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-medium text-white" style={{ background: 'var(--accent)' }}>Save Event</button>
        </div>
      </form>
    </div>
  )
}
