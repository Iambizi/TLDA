import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Login',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--neutral-50)' }}>
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: 'var(--brand-100)' }}>
            <span className="text-xl" style={{ color: 'var(--brand-600)' }}>✦</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--neutral-900)' }}>
            Organizer Login
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Group Date — Singles Event Platform
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <LoginForm />
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted)' }}>
          Organizer access only. Not a participant login.
        </p>
      </div>
    </main>
  )
}
