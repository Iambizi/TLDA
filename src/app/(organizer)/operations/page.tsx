'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { EVENT_STATUS_LABELS } from '@/lib/constants'

export default function OperationsPage() {
  const dashboard = useQuery(api.operations.getDashboardData)

  if (dashboard === undefined) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>Loading...</div>
  }

  const { globalRevenue, globalCosts, globalNet, events } = dashboard

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
          Operations
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Track event economics and operational performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        {[
          { label: 'Global Revenue', value: formatCurrency(globalRevenue) },
          { label: 'Global Costs', value: formatCurrency(globalCosts) },
          { label: 'Global Net', value: formatCurrency(globalNet) },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--neutral-900)' }}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {events.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No events found.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50/50 border-b uppercase text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              <tr>
                <th className="px-6 py-4 font-medium">Event</th>
                <th className="px-6 py-4 font-medium">Participants</th>
                <th className="px-6 py-4 font-medium">Revenue</th>
                <th className="px-6 py-4 font-medium">Costs</th>
                <th className="px-6 py-4 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={event.id} className="hover:bg-neutral-50/50" style={index === 0 ? undefined : { boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.14)' }}>
                  <td className="px-6 py-4">
                    <Link href={`/events/${event.id}`} className="font-medium hover:underline" style={{ color: 'var(--neutral-900)' }}>
                      {event.title}
                    </Link>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'} · {EVENT_STATUS_LABELS[event.status as keyof typeof EVENT_STATUS_LABELS] ?? event.status}
                    </p>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--neutral-700)' }}>{event.participantCount}</td>
                  <td className="px-6 py-4" style={{ color: 'var(--muted)' }}>{formatCurrency(event.revenue)}</td>
                  <td className="px-6 py-4" style={{ color: 'var(--muted)' }}>{formatCurrency(event.costs)}</td>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--neutral-900)' }}>{formatCurrency(event.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
