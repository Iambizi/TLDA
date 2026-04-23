import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants'
import type { Database } from '@/types/database'

export const metadata: Metadata = {
  title: 'Dashboard',
}

type ApplicationStatus = Database['public']['Enums']['application_status']

interface RecentApplicationRow {
  id: string
  status: ApplicationStatus
  submitted_at: string
  participants: {
    id: string
    full_name: string
    age: number | null
    gender: string | null
  } | null
}

interface FormattedRecentApplication {
  id: string
  participant_id: string | undefined
  status: ApplicationStatus
  submitted_at: string
  full_name: string
  age: number | null
  gender: string | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Fetch metrics in parallel
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoIso = weekAgo.toISOString()

  const [
    { count: totalApplicants },
    { count: pendingReview },
    { count: newThisWeek },
    { count: upcomingEvents },
  ] = await Promise.all([
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).in('status', ['applied', 'under_review']),
    supabase.from('applications').select('*', { count: 'exact', head: true }).gte('submitted_at', weekAgoIso),
    supabase.from('events').select('*', { count: 'exact', head: true }).in('status', ['open', 'draft']),
  ])

  // 2. Fetch recent applications with participant info
  // Using explicit select and cast to avoid inference issues with complex joins
  const { data: recentApplicationsData } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      submitted_at,
      participants:participant_id (
        id,
        full_name,
        age,
        gender
      )
    `)
    .order('submitted_at', { ascending: false })
    .limit(5)

  const recentApplications = (recentApplicationsData ?? []) as RecentApplicationRow[]

  const formattedRecent: FormattedRecentApplication[] = recentApplications.map((app) => ({
    id: app.id,
    participant_id: app.participants?.id,
    status: app.status,
    submitted_at: app.submitted_at,
    full_name: app.participants?.full_name ?? 'Unknown',
    age: app.participants?.age,
    gender: app.participants?.gender,
  }))

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-10">
        {[
          { label: 'Total Applicants', value: totalApplicants ?? 0 },
          { label: 'Pending Review', value: pendingReview ?? 0 },
          { label: 'New This Week', value: newThisWeek ?? 0 },
          { label: 'Upcoming Events', value: upcomingEvents ?? 0 },
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
          {formattedRecent.length === 0 ? (
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
                  {formattedRecent.map((app, index) => {
                    const statusColorClass = APPLICATION_STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-500'
                    const date = new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-neutral-50/50 transition-colors"
                        style={index === 0 ? undefined : { boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.14)' }}
                      >
                        <td className="px-6 py-4">
                          <Link 
                            href={`/participants/${app.participant_id}`}
                            className="font-medium hover:underline"
                            style={{ color: 'var(--neutral-900)' }}
                          >
                            {app.full_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--neutral-600)' }}>
                          {[app.age, app.gender].filter(Boolean).join(' • ')}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass}`}
                          >
                            {APPLICATION_STATUS_LABELS[app.status] || app.status}
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
