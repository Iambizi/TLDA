import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Matches' }

const connectionLabels: Record<string, string> = {
  potential_match: 'Connected',
  introduced_off_platform: 'Exchanged Contacts',
  mutual_interest: 'Went on a Date',
  no_match: 'No Follow-Up',
  follow_up_needed: 'Follow-Up Needed',
  one_sided_interest: 'Connected',
}

export default async function GlobalMatchesPage() {
  const supabase = await createClient() as any

  const { data: matchesRaw } = await supabase
    .from('match_outcomes')
    .select(`
      id,
      event_id,
      interest_status,
      organizer_notes,
      created_at,
      events(id, title),
      participant_a:participants!participant_a_id(id, full_name),
      participant_b:participants!participant_b_id(id, full_name)
    `)
    .order('created_at', { ascending: false })

  const matches = (matchesRaw || []).map((match: any) => ({
    id: match.id,
    event_id: match.event_id,
    event_title: match.events?.title ?? 'Unknown event',
    status: connectionLabels[match.interest_status] ?? match.interest_status,
    notes: match.organizer_notes,
    date: new Date(match.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    participant_a: match.participant_a,
    participant_b: match.participant_b,
  }))

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Matches
          </h1>
          <span
            title="Global outcome tracking across events. New v3 connection statuses are mapped onto the current match outcome table until the schema migration lands."
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
              {matches.map((match: any, index: number) => (
                <tr key={match.id} className="hover:bg-neutral-50/50" style={index === 0 ? undefined : { boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.14)' }}>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--neutral-900)' }}>
                    <Link href={`/participants/${match.participant_a?.id}`} className="hover:underline">{match.participant_a?.full_name ?? 'Unknown'}</Link>
                    <span style={{ color: 'var(--muted)' }}> + </span>
                    <Link href={`/participants/${match.participant_b?.id}`} className="hover:underline">{match.participant_b?.full_name ?? 'Unknown'}</Link>
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
