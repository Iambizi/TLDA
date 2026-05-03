import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MatchLogger } from './match-logger'
import { INTEREST_STATUS_LABELS } from '@/lib/constants'

export const metadata: Metadata = { title: 'Match Outcomes' }

interface MatchesPageProps {
  params: Promise<{ id: string }>
}

export default async function MatchesPage({ params }: MatchesPageProps) {
  const { id } = await params
  const supabase = await createClient() as any

  // 1. Fetch event
  const { data: event } = await supabase
    .from('events')
    .select('id, title, event_date')
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  // 2. Fetch logged matches
  const { data: matchOutcomesRaw } = await supabase
    .from('match_outcomes')
    .select(`
      id,
      interest_status,
      organizer_notes,
      created_at,
      participant_a:participants!participant_a_id(id, full_name),
      participant_b:participants!participant_b_id(id, full_name)
    `)
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  const matchOutcomes = (matchOutcomesRaw || []).map((mo: any) => ({
    id: mo.id,
    interest_status: mo.interest_status,
    notes: mo.organizer_notes,
    date: new Date(mo.created_at).toLocaleDateString(),
    participant_a: { id: mo.participant_a.id, name: mo.participant_a.full_name },
    participant_b: { id: mo.participant_b.id, name: mo.participant_b.full_name },
  }))

  // 3. Fetch roster participants for preliminary matching
  const { data: attendeesRaw } = await supabase
    .from('event_participants')
    .select(`
      participant_id,
      participants(id, full_name)
    `)
    .eq('event_id', id)

  const attendedParticipants = (attendeesRaw || []).map((ap: any) => ({
    id: ap.participants.id,
    full_name: ap.participants.full_name,
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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
                Preliminary Matching
              </h1>
              <span
                title="Use this page to plan pairings before the event and update outcomes after follow-up."
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
              >
                i
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Pairing and outcome tracker for {event.title}
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
                    {matchOutcomes.map((match: any) => (
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

        {/* Right Column: Matcher */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-8">
            <MatchLogger eventId={event.id} participants={attendedParticipants} />
          </div>
        </div>

      </div>
    </div>
  )
}
