'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants'

export default function DashboardPage() {
  const summary = useQuery(api.dashboard.summary)

  if (summary === undefined) {
    return (
      <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>
        Loading dashboard...
      </div>
    )
  }

  const { recentSubmissions } = summary

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Welcome back. Here&apos;s an overview of your pipeline.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-10">
        {[
          { label: 'Total Applications', value: summary.totalApplications },
          { label: 'Pending Review', value: summary.pendingReview },
          { label: 'New This Week', value: summary.newThisWeek },
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

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Recent Applications
          </h2>
          <Link
            href="/participants"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View all →
          </Link>
        </div>

        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {recentSubmissions.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--muted)' }}>
              <p className="text-sm">No applications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50/50 border-b uppercase text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                  <tr>
                    <th className="px-6 py-4 font-medium">Applicant</th>
                    <th className="px-6 py-4 font-medium">Demographics</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((app, index) => {
                    const statusColorClass = APPLICATION_STATUS_COLORS[app.status as keyof typeof APPLICATION_STATUS_COLORS] || 'bg-gray-100 text-gray-500'
                    const date = new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    
                    return (
                      <tr
                        key={app._id}
                        className="hover:bg-neutral-50/50 transition-colors"
                        style={index === 0 ? undefined : { boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.14)' }}
                      >
                        <td className="px-6 py-4">
                          <Link 
                            href={`/participants/${app.participant_id}`}
                            className="font-medium hover:underline"
                            style={{ color: 'var(--neutral-900)' }}
                          >
                            {app.participant?.full_name ?? 'Unknown'}
                          </Link>
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--neutral-600)' }}>
                          {[app.participant?.age, app.participant?.gender].filter(Boolean).join(' • ')}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass}`}
                          >
                            {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" style={{ color: 'var(--muted)' }}>
                          {date}
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
    </div>
  )
}
