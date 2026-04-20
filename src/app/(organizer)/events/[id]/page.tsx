import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EVENT_STATUS_LABELS } from '@/lib/constants'
import { ParticipantAssigner } from './assigner'
import { RemoveParticipantButton } from './remove-button'

export const metadata: Metadata = { title: 'Event Details' }

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient() as any

  // 1. Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  // 2. Fetch the roster (event_participants joined with participants)
  const { data: rosterRaw } = await supabase
    .from('event_participants')
    .select(`
      id,
      attendance_status,
      participant_id,
      participants (
        id,
        full_name,
        age,
        gender,
        contact_info
      )
    `)
    .eq('event_id', id)

  const roster = (rosterRaw || []).map((rp: any) => ({
    id: rp.id,
    participant_id: rp.participant_id,
    attendance_status: rp.attendance_status,
    full_name: rp.participants?.full_name ?? 'Unknown',
    age: rp.participants?.age,
    gender: rp.participants?.gender,
    contact_info: rp.participants?.contact_info,
  }))

  const rosterParticipantIds = roster.map((r: any) => r.participant_id)

  // 3. Fetch approved applicants not already on the roster
  const { data: approvedApps } = await supabase
    .from('applications')
    .select(`
      id,
      participant_id,
      participants (
        id,
        full_name,
        age,
        gender
      )
    `)
    .eq('status', 'approved')

  const availableParticipants = (approvedApps || [])
    .filter((app: any) => app.participant_id && !rosterParticipantIds.includes(app.participant_id))
    .map((app: any) => ({
      id: app.participants.id,
      full_name: app.participants.full_name,
      age: app.participants.age,
      gender: app.participants.gender,
    }))

  const dateStr = event.event_date 
    ? new Date(event.event_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) 
    : 'TBD'

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/events"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--neutral-500)' }}
        >
          ← Back to events
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Event Details & Roster */}
        <div className="flex-1">
          <div className="rounded-2xl border p-8 shadow-sm mb-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--neutral-900)' }}>
                  {event.title}
                </h1>
                <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  {dateStr}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'var(--neutral-100)', color: 'var(--neutral-800)' }}>
                {EVENT_STATUS_LABELS[event.status as keyof typeof EVENT_STATUS_LABELS] || event.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Location</p>
                <p className="text-sm" style={{ color: 'var(--neutral-900)' }}>{event.location || 'TBD'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Roster Size</p>
                <p className="text-sm" style={{ color: 'var(--neutral-900)' }}>{roster.length} participants</p>
              </div>
            </div>

            {event.description && (
              <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Description</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--neutral-800)' }}>{event.description}</p>
              </div>
            )}

            {event.notes && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-900 mb-1">Organizer Notes</p>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">{event.notes}</p>
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>
            Event Roster
          </h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {roster.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No participants assigned yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50/50 border-b uppercase text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    <tr>
                      <th className="px-6 py-4 font-medium">Participant</th>
                      <th className="px-6 py-4 font-medium">Demographics</th>
                      <th className="px-6 py-4 font-medium">Contact</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {roster.map((p: any) => (
                      <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link 
                            href={`/participants/${p.participant_id}`}
                            className="font-medium hover:underline"
                            style={{ color: 'var(--neutral-900)' }}
                          >
                            {p.full_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--neutral-600)' }}>
                          {[p.age, p.gender].filter(Boolean).join(' • ')}
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--neutral-600)' }}>
                          {p.contact_info}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <RemoveParticipantButton eventId={event.id} participantId={p.participant_id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assigner */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-8">
            <ParticipantAssigner eventId={event.id} availableParticipants={availableParticipants} />
          </div>
        </div>
      </div>
    </div>
  )
}
