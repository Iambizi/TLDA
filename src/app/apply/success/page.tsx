import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Application Submitted',
}

export default function ApplySuccessPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--neutral-50)' }}
    >
      <div className="max-w-md w-full text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{ background: 'var(--brand-100)' }}
        >
          <span className="text-2xl" style={{ color: 'var(--brand-600)' }}>✦</span>
        </div>

        <h1 className="text-2xl font-semibold mb-3" style={{ color: 'var(--neutral-900)' }}>
          You&apos;re in the pipeline!
        </h1>
        <p className="text-base mb-2" style={{ color: 'var(--neutral-700)' }}>
          Thank you for applying. We&apos;ve received your information and will be in touch soon.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Our organizer reviews every application personally. Expect to hear from us within a few days.
        </p>

        <div
          className="rounded-2xl border p-5 mb-8 text-left"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--neutral-800)' }}>
            What happens next
          </p>
          <ul className="flex flex-col gap-2">
            {[
              'We review your application',
              'We may reach out to schedule a quick chat',
              'If it\'s a fit, we\'ll invite you to an upcoming event',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--neutral-600)' }}>
                <span className="font-semibold shrink-0" style={{ color: 'var(--accent)' }}>{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="text-sm font-medium"
          style={{ color: 'var(--accent)' }}
          id="back-to-home"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  )
}
