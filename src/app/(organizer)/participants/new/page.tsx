'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ApplicationFormClient } from '@/app/apply/application-form-client'

export default function NewParticipantPage() {
  const router = useRouter()

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/participants"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--neutral-500)' }}
        >
          ← Back to participants
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
          Add Participant
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Manually create a participant and linked application record using the same intake rules as the public form.
        </p>
      </div>

      <ApplicationFormClient
        submitLabel="Create Participant"
        pendingLabel="Creating…"
        footerNote="This creates both the participant profile and its linked application record for organizer review."
        onSuccess={() => router.push('/participants')}
      />
    </div>
  )
}
