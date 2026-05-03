'use client'

import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'

export function LoginForm() {
  const { signIn } = useAuthActions()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await signIn('password', { email, password, flow: 'signIn' })
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="login-form">
      {/* Error message */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
          role="alert"
          id="login-error"
        >
          {error}
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-email"
          className="text-sm font-medium"
          style={{ color: 'var(--neutral-700)' }}
        >
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="organizer@example.com"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--neutral-900)',
            background: 'var(--neutral-50)',
          }}
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-password"
          className="text-sm font-medium"
          style={{ color: 'var(--neutral-700)' }}
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--neutral-900)',
            background: 'var(--neutral-50)',
          }}
        />
      </div>

      {/* Submit */}
      <button
        id="login-submit"
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60"
        style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
