import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Events' }

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--neutral-900)' }}>
        Events
      </h1>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        Event management coming in Step 6.
      </p>
    </div>
  )
}
