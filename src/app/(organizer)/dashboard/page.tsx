import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Welcome back. Here&apos;s an overview of your pipeline.
        </p>
      </div>

      {/* Placeholder stat cards — real data in step 5 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Applicants', value: '—' },
          { label: 'Pending Review', value: '—' },
          { label: 'Upcoming Events', value: '—' },
          { label: 'This Week', value: '—' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Dashboard data will be wired up in Step 5. Auth is working — you&apos;re in! ✦
        </p>
      </div>
    </div>
  )
}
