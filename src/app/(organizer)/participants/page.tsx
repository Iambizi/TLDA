'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants";

export default function ParticipantsPage() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')

  const participants = useQuery(api.participants.list)

  if (participants === undefined) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>Loading participants...</div>
  }

  const filtered = participants.filter((p) => {
    if (!statusFilter) return true;
    return p.application?.status === statusFilter;
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ color: "var(--neutral-900)" }}
          >
            Participants
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {filtered.length} total applicant
            {filtered.length === 1 ? "" : "s"} found.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/participants/new"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
            style={{ background: "var(--accent)" }}
          >
            + Add Participant
          </Link>
          <Link
            href="/participants/import"
            className="rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-neutral-100 shadow-sm border"
            style={{
              background: "var(--surface)",
              color: "var(--neutral-700)",
              borderColor: "var(--border)",
            }}
          >
            Import CSV
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/participants"
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          style={{
            background: !statusFilter
              ? "var(--neutral-200)"
              : "var(--neutral-100)",
            color: !statusFilter ? "var(--neutral-900)" : "var(--neutral-600)",
          }}
        >
          All
        </Link>
        {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => {
          const isActive = statusFilter === key;
          const colorClass =
            APPLICATION_STATUS_COLORS[
              key as keyof typeof APPLICATION_STATUS_LABELS
            ] || "bg-neutral-100 text-neutral-600";
          return (
            <Link
              key={key}
              href={`/participants?status=${key}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive ? colorClass : "bg-neutral-100 text-neutral-600"
              }`}
              style={{
                border: isActive
                  ? `1px solid currentColor`
                  : "1px solid transparent",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No participants found matching the current filters.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="/participants/new"
                className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
                style={{ background: "var(--accent)" }}
              >
                Add Participant Manually
              </Link>
              <Link
                href="/participants/import"
                className="rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-neutral-100 shadow-sm border"
                style={{
                  background: "var(--surface)",
                  color: "var(--neutral-700)",
                  borderColor: "var(--border)",
                }}
              >
                Import CSV
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead
                className="bg-neutral-50/50 border-b uppercase text-xs"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                <tr>
                  <th className="px-6 py-4 font-medium">Applicant</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Demographics</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Applied</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, index) => {
                  const status = p.application?.status ?? 'applied'
                  const statusColorClass =
                    APPLICATION_STATUS_COLORS[status as keyof typeof APPLICATION_STATUS_COLORS] ||
                    "bg-gray-100 text-gray-500";
                  
                  const submittedAt = p.application?.submitted_at
                  const date = submittedAt ? new Date(submittedAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  ) : 'Unknown';

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-neutral-50/50 transition-colors"
                      style={
                        index === 0
                          ? undefined
                          : {
                              boxShadow:
                                "inset 0 1px 0 rgba(148, 163, 184, 0.14)",
                            }
                      }
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/participants/${p._id}`}
                          className="font-medium hover:underline"
                          style={{ color: "var(--neutral-900)" }}
                        >
                          {p.full_name}
                        </Link>
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ color: "var(--neutral-600)" }}
                      >
                        <span
                          className="truncate max-w-[200px] block"
                          title={p.contact_info}
                        >
                          {p.contact_info}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ color: "var(--neutral-600)" }}
                      >
                        {[p.age, p.gender].filter(Boolean).join(" • ")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass}`}
                        >
                          {APPLICATION_STATUS_LABELS[status as keyof typeof APPLICATION_STATUS_LABELS] || status}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-right tabular-nums"
                        style={{ color: "var(--muted)" }}
                      >
                        {date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
