import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Participants" };

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface ParticipantListRow {
  id: string;
  status: ApplicationStatus;
  submitted_at: string;
  participants: {
    id: string;
    full_name: string;
    age: number | null;
    gender: string | null;
    contact_info: string;
  } | null;
}

interface FormattedParticipantApplication {
  id: string;
  participant_id: string | undefined;
  status: ApplicationStatus;
  submitted_at: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  contact: string | undefined;
}

interface ParticipantsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParticipantsPage({
  searchParams,
}: ParticipantsPageProps) {
  const supabase = await createClient();
  const { status } = await searchParams;

  const statusFilter = typeof status === "string" ? status : undefined;

  let query = supabase
    .from("applications")
    .select(
      `
      id,
      status,
      submitted_at,
      participants:participant_id (
        id,
        full_name,
        age,
        gender,
        contact_info
      )
    `,
    )
    .order("submitted_at", { ascending: false });

  if (
    statusFilter &&
    Object.keys(APPLICATION_STATUS_LABELS).includes(statusFilter)
  ) {
    query = query.eq("status", statusFilter as ApplicationStatus);
  }

  const { data: applicationsData, error } = await query;

  if (error) {
    console.error("Error fetching participants:", error);
  }

  const applications = (applicationsData ?? []) as ParticipantListRow[];

  const formattedApplications: FormattedParticipantApplication[] =
    applications.map((app) => ({
      id: app.id,
      participant_id: app.participants?.id,
      status: app.status,
      submitted_at: app.submitted_at,
      full_name: app.participants?.full_name ?? "Unknown",
      age: app.participants?.age ?? null,
      gender: app.participants?.gender ?? null,
      contact: app.participants?.contact_info,
    }));

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
            {formattedApplications.length} total applicant
            {formattedApplications.length === 1 ? "" : "s"} found.
          </p>
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
        {formattedApplications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No participants found matching the current filters.
            </p>
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
                {formattedApplications.map((app, index) => {
                  const statusColorClass =
                    APPLICATION_STATUS_COLORS[app.status] ||
                    "bg-gray-100 text-gray-500";
                  const date = new Date(app.submitted_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  );

                  return (
                    <tr
                      key={app.id}
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
                          href={`/participants/${app.participant_id}`}
                          className="font-medium hover:underline"
                          style={{ color: "var(--neutral-900)" }}
                        >
                          {app.full_name}
                        </Link>
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ color: "var(--neutral-600)" }}
                      >
                        <span
                          className="truncate max-w-[200px] block"
                          title={app.contact}
                        >
                          {app.contact}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ color: "var(--neutral-600)" }}
                      >
                        {[app.age, app.gender].filter(Boolean).join(" • ")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass}`}
                        >
                          {APPLICATION_STATUS_LABELS[app.status] || app.status}
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
