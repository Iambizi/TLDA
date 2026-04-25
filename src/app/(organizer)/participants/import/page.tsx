import type { Metadata } from 'next'
import Link from 'next/link'
import { ImportClient } from './import-client'

export const metadata: Metadata = { title: 'Import Applicants' }

export default function ParticipantsImportPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/participants"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--neutral-500)' }}
        >
          ← Back to participants
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--neutral-900)' }}>
          Import Applicants from CSV
        </h1>
        <p className="text-sm max-w-3xl" style={{ color: 'var(--muted)' }}>
          Bring previously managed applicant profiles into Group Date without changing the existing schema. Review the auto-mapped columns, preview duplicates and validation errors, then import only the clean rows.
        </p>
      </div>

      <ImportClient />
    </div>
  )
}
