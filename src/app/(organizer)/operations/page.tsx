'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { EVENT_STATUS_LABELS } from '@/lib/constants'

export default function OperationsPage() {
  const eventsRaw = useQuery(api.events.list)

  if (eventsRaw === undefined) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>Loading...</div>
  }

  const events = eventsRaw.map((event) => ({
    id: event._id,
    title: event.title,
    status: event.status,
    date: event.event_date
      ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'TBD',
    participantCount: event.rosterCount ?? 0,
  }))

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
          Operations
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Track event economics and operational performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        {[
          { label: 'Global Revenue', value: '$0', note: 'Requires participant payment fields' },
          { label: 'Global Costs', value: '$0', note: 'Requires event expense table' },
          { label: 'Global Net', value: '$0', note: 'Revenue minus costs' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--neutral-900)' }}>{metric.value}</p>
            <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {events.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No events found.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50/50 border-b uppercase text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              <tr>
                <th className="px-6 py-4 font-medium">Event</th>
                <th className="px-6 py-4 font-medium">Participants</th>
                <th className="px-6 py-4 font-medium">Revenue</th>
                <th className="px-6 py-4 font-medium">Costs</th>
                <th className="px-6 py-4 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={event.id} className="hover:bg-neutral-50/50" style={index === 0 ? undefined : { boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.14)' }}>
                  <td className="px-6 py-4">
                    <Link href={`/events/${event.id}`} className="font-medium hover:underline" style={{ color: 'var(--neutral-900)' }}>
                      {event.title}
                    </Link>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {event.date} · {EVENT_STATUS_LABELS[event.status as keyof typeof EVENT_STATUS_LABELS] ?? event.status}
                    </p>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--neutral-700)' }}>{event.participantCount}</td>
                  <td className="px-6 py-4" style={{ color: 'var(--muted)' }}>$0</td>
                  <td className="px-6 py-4" style={{ color: 'var(--muted)' }}>$0</td>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--neutral-900)' }}>$0</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)', color: 'var(--muted)' }}>
        Financial values are placeholders until the v3 schema adds <code>event_expenses</code> and <code>event_participants.payment_amount</code>.
      </div>
    </div>
  )
}
