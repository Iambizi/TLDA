'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { INTEREST_STATUS_LABELS } from '@/lib/constants'

export default function GlobalMatchesPage() {
  const matchesRaw = useQuery(api.matches.listAll)

  if (matchesRaw === undefined) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>Loading matches...</div>
  }

  const matches = matchesRaw.map((match) => ({
    id: match._id,
    event_id: match.event_id,
    event_title: match.event?.title ?? 'Unknown event',
    status: INTEREST_STATUS_LABELS[match.interest_status as keyof typeof INTEREST_STATUS_LABELS] ?? match.interest_status,
    notes: match.organizer_notes,
    date: new Date(match._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    participant_a: { id: match.participantA?._id, full_name: match.participantA?.full_name ?? 'Unknown' },
    participant_b: { id: match.participantB?._id, full_name: match.participantB?.full_name ?? 'Unknown' },
  }))

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Matches
          </h1>
          <span
            title="Global outcome tracking across events. Log matches from any event's matching page."
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
          >
            i
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Track whether introductions turn into real outcomes after events.
        </p>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {matches.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
            No matches logged yet. Add matches from an event&apos;s matching page.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50/50 border-b uppercase text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              <tr>
                <th className="px-6 py-4 font-medium">Participants</th>
                <th className="px-6 py-4 font-medium">Event</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Notes</th>
                <th className="px-6 py-4 font-medium text-right">Logged</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr key={match.id} className="hover:bg-neutral-50/50" style={index === 0 ? undefined : { boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.14)' }}>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--neutral-900)' }}>
                    <Link href={`/participants/${match.participant_a.id}`} className="hover:underline">{match.participant_a.full_name}</Link>
                    <span style={{ color: 'var(--muted)' }}> + </span>
                    <Link href={`/participants/${match.participant_b.id}`} className="hover:underline">{match.participant_b.full_name}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/events/${match.event_id}`} className="hover:underline" style={{ color: 'var(--neutral-700)' }}>
                      {match.event_title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-md px-2 py-1 text-xs font-medium" style={{ background: 'var(--neutral-100)', color: 'var(--neutral-800)' }}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-sm truncate" style={{ color: 'var(--muted)' }}>{match.notes || '—'}</td>
                  <td className="px-6 py-4 text-right" style={{ color: 'var(--muted)' }}>{match.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
