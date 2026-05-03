'use client'

import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import type { Id } from '../../../../../../convex/_generated/dataModel'
import { MatchLogger } from './match-logger'
import { INTEREST_STATUS_LABELS } from '@/lib/constants'

export default function MatchesPage() {
  const params = useParams<{ id: Id<'events'> }>()
  const id = params?.id

  const eventData = useQuery(api.events.getById, id ? { id } : 'skip')
  const matchOutcomesRaw = useQuery(api.matches.listByEvent, id ? { eventId: id } : 'skip')

  if (eventData === undefined || matchOutcomesRaw === undefined) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>Loading matches...</div>
  }

  if (eventData === null) {
    notFound()
  }

  const { roster, ...event } = eventData

  const matchOutcomes = matchOutcomesRaw.map((mo) => ({
    id: mo._id,
    interest_status: mo.interest_status,
    notes: mo.organizer_notes,
    date: new Date(mo.updatedAt).toLocaleDateString(),
    participant_a: { id: mo.participantA?._id, name: mo.participantA?.full_name ?? 'Unknown' },
    participant_b: { id: mo.participantB?._id, name: mo.participantB?.full_name ?? 'Unknown' },
  }))

  // All roster members are available for preliminary matching
  const rosterParticipants = roster.map((rp) => ({
    id: rp.participant_id,
    full_name: rp.participant?.full_name ?? 'Unknown',
  }))

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/events/${id}`}
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--neutral-500)' }}
        >
          ← Back to event details
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Logged Matches */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--neutral-900)' }}>
              Match Outcomes
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Preliminary & post-event tracker for {event.title}
            </p>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {matchOutcomes.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No matches logged yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50/50 border-b uppercase text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    <tr>
                      <th className="px-6 py-4 font-medium">Participant A</th>
                      <th className="px-6 py-4 font-medium">Participant B</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {matchOutcomes.map((match) => (
                      <tr key={match.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium" style={{ color: 'var(--neutral-900)' }}>
                          <Link href={`/participants/${match.participant_a.id}`} className="hover:underline">
                            {match.participant_a.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-medium" style={{ color: 'var(--neutral-900)' }}>
                          <Link href={`/participants/${match.participant_b.id}`} className="hover:underline">
                            {match.participant_b.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium w-max" style={{ background: 'var(--neutral-100)', color: 'var(--neutral-800)' }}>
                              {INTEREST_STATUS_LABELS[match.interest_status as keyof typeof INTEREST_STATUS_LABELS] || match.interest_status}
                            </span>
                            {match.notes && (
                              <span className="text-xs mt-1 italic" style={{ color: 'var(--muted)' }}>
                                &quot;{match.notes}&quot;
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Match Logger */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-8">
            <MatchLogger eventId={event._id} participants={rosterParticipants} />
          </div>
        </div>

      </div>
    </div>
  )
}
