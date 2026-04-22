import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-5xl">✦</span>
        </div>
        <h1 className="text-4xl font-semibold mb-3 tracking-tight">Group Date</h1>
        <p className="text-neutral-500 mb-10 text-lg">
          Singles Event Platform
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/apply"
            className="px-6 py-3 rounded-xl font-medium text-white transition-all"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Apply to an Event
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl font-medium border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--neutral-700)' }}
          >
            Organizer Login
          </Link>
        </div>
      </div>
    </main>
  )
}
