import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Participants' }

export default function ParticipantsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--neutral-900)' }}>
        Participants
      </h1>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        Participant list and search coming in Step 5.
      </p>
    </div>
  )
}
