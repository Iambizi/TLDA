'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants'

function StatusBadge({ status }: { status: string }) {
  const statusColorClass = APPLICATION_STATUS_COLORS[status as keyof typeof APPLICATION_STATUS_COLORS] || 'bg-neutral-100 text-neutral-600'
  const label = APPLICATION_STATUS_LABELS[status as keyof typeof APPLICATION_STATUS_LABELS] || status
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColorClass}`}>
      {label}
    </span>
  )
}

export default function DashboardPage() {
  const summary = useQuery(api.dashboard.summary)

  if (summary === undefined) {
    return (
      <div className="p-8 text-sm flex items-center justify-center min-h-[400px]" style={{ color: 'var(--muted)' }}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-neutral-300 animate-spin" />
          Loading your dashboard...
        </div>
      </div>
    )
  }

  const { recentSubmissions, upcomingEventsList, statusCounts } = summary

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--neutral-900)' }}>
            Dashboard
          </h1>
          <p className="mt-1 text-base" style={{ color: 'var(--muted)' }}>
            Welcome back. Here&apos;s the current state of your pipeline.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Applications', value: summary.totalApplications, highlight: summary.newThisWeek > 0 ? `+${summary.newThisWeek} this week` : null },
          { label: 'Pending Review', value: summary.pendingReview },
          { label: 'Upcoming Events', value: summary.upcomingEvents },
          { label: 'Matches Made', value: summary.totalMatches },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-6 flex flex-col justify-between shadow-sm"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
              {stat.label}
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold tracking-tight" style={{ color: 'var(--neutral-900)' }}>
                {stat.value}
              </p>
              {stat.highlight && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stat.highlight}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/events/new" className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors text-lg">
                  🎟️
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Create Event</span>
              </Link>
              
              <Link href="/participants" className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors text-lg">
                  👥
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Review Apps</span>
              </Link>

              <Link href="/matches" className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 text-pink-600 group-hover:bg-pink-100 transition-colors text-lg">
                  💞
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Log Match</span>
              </Link>

              <Link href="/settings/questionnaire" className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors text-lg">
                  📝
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Edit Forms</span>
              </Link>
            </div>
          </div>

          {/* Recent Applications */}
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
                View all pipeline →
              </Link>
            </div>

            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {recentSubmissions.length === 0 ? (
                <div className="p-12 text-center" style={{ color: 'var(--muted)' }}>
                  <p className="text-sm">No applications have been submitted yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50/80 border-b uppercase text-[10px] tracking-wider font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      <tr>
                        <th className="px-6 py-4">Applicant</th>
                        <th className="px-6 py-4">Demographics</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubmissions.map((app, index) => {
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
                                className="font-medium hover:underline text-sm"
                                style={{ color: 'var(--neutral-900)' }}
                              >
                                {app.participant?.full_name ?? 'Unknown'}
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--neutral-600)' }}>
                              {[app.participant?.age, app.participant?.gender].filter(Boolean).join(' • ')}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="px-6 py-4 text-right text-xs" style={{ color: 'var(--muted)' }}>
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

        {/* Right Column (Side Widgets) */}
        <div className="space-y-8">
          
          {/* Setup Notice */}
          {!summary.hasActiveQuestionnaire && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h3 className="font-semibold text-amber-900 mb-2">Platform Setup</h3>
              <p className="text-sm text-amber-800 mb-4 leading-relaxed">
                You haven't set an active application form yet. The public portal is currently closed.
              </p>
              <Link 
                href="/settings/questionnaire"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Setup Questionnaire
              </Link>
            </div>
          )}

          {/* Upcoming Events */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>
              Upcoming Events
            </h2>
            <div className="rounded-2xl border shadow-sm divide-y" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {upcomingEventsList.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--muted)' }}>
                  <p className="text-sm">No upcoming events scheduled.</p>
                </div>
              ) : (
                upcomingEventsList.map(event => {
                  const date = event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'
                  return (
                    <div key={event._id} className="p-5 flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <Link href={`/events/${event._id}`} className="font-semibold hover:underline" style={{ color: 'var(--neutral-900)' }}>
                          {event.title}
                        </Link>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                          {date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted)' }}>
                        <span className="truncate pr-4">📍 {event.location || 'No location set'}</span>
                        <Link href={`/events/${event._id}`} className="text-brand-500 hover:underline shrink-0 text-xs font-medium">
                          View Roster
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Pipeline Breakdown */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>
              Pipeline Breakdown
            </h2>
            <div className="rounded-2xl border p-6 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="space-y-4">
                {Object.entries(APPLICATION_STATUS_LABELS).map(([statusKey, label]) => {
                  const count = statusCounts[statusKey] || 0
                  // Skip displaying status if count is 0, except for common ones to keep it looking like a dashboard
                  if (count === 0 && !['applied', 'under_review', 'approved'].includes(statusKey)) return null
                  
                  return (
                    <div key={statusKey} className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2" style={{ color: 'var(--neutral-700)' }}>
                        <div className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                        {label}
                      </span>
                      <span className={`text-sm font-medium ${count > 0 ? 'text-neutral-900' : 'text-neutral-400'}`}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
