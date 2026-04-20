import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EVENT_STATUS_LABELS } from '@/lib/constants'

export const metadata: Metadata = { title: 'Events' }

export default async function EventsPage() {
  const supabase = await createClient() as any

  // Fetch events and count of event_participants
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      event_date,
      location,
      status,
      event_participants ( count )
    `)
    .order('event_date', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching events:', error)
  }

  const formattedEvents = (events || []).map((ev: any) => ({
    id: ev.id,
    title: ev.title,
    date: ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    location: ev.location || 'TBD',
    status: ev.status as keyof typeof EVENT_STATUS_LABELS,
    rosterCount: ev.event_participants?.[0]?.count ?? 0,
  }))

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--neutral-900)' }}>
            Events
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Manage upcoming dates and assignments.
          </p>
        </div>
        <Link
          href="/events/new"
          className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
          style={{ background: 'var(--accent)' }}
        >
          + Create Event
        </Link>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {formattedEvents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No events created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/50 border-b uppercase text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                <tr>
                  <th className="px-6 py-4 font-medium">Event Title</th>
                  <th className="px-6 py-4 font-medium">Date & Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Roster Size</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {formattedEvents.map((ev: any) => {
                  return (
                    <tr key={ev.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/events/${ev.id}`}
                          className="font-medium hover:underline block"
                          style={{ color: 'var(--neutral-900)' }}
                        >
                          {ev.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--neutral-600)' }}>
                        <div className="flex flex-col">
                          <span>{ev.date}</span>
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>{ev.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium" style={{ background: 'var(--neutral-100)', color: 'var(--neutral-700)' }}>
                          {EVENT_STATUS_LABELS[ev.status as keyof typeof EVENT_STATUS_LABELS] || ev.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-medium" style={{ color: 'var(--neutral-700)' }}>
                        {ev.rosterCount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
