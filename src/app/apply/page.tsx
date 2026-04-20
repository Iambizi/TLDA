import type { Metadata } from 'next'
import { ApplicationFormClient } from './application-form-client'

export const metadata: Metadata = {
  title: 'Apply',
  description: 'Apply to attend a singles event. Tell us about yourself and who you\'re looking for.',
}

export default function ApplyPage() {
  return (
    <main className="min-h-screen py-12 px-4" style={{ background: 'var(--neutral-50)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
            style={{ background: 'var(--brand-100)' }}
          >
            <span className="text-xl" style={{ color: 'var(--brand-600)' }}>✦</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--neutral-900)' }}>
            Apply to an Event
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>
            Tell us a little about yourself and who you&apos;re looking for.<br />
            This stays with us — no profile is visible to others.
          </p>
        </div>

        {/* Form */}
        <ApplicationFormClient />
      </div>
    </main>
  )
}
