'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/participants', label: 'Participants', icon: '👥' },
  { href: '/events', label: 'Events', icon: '🎟️' },
  { href: '/matches', label: 'Matches', icon: '💞' },
  { href: '/operations', label: 'Operations', icon: '💰' },
  { href: '/settings/questionnaire', label: 'Questionnaire', icon: '📝' },
]

export function OrganizerNav() {
  const pathname = usePathname()
  const { signOut } = useAuthActions()
  const user = useQuery(api.users.current)
  
  const userEmail = user?.email ?? 'Loading...'

  return (
    <aside
      className="w-56 shrink-0 flex flex-col min-h-screen border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Brand */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <span className="text-lg" style={{ color: 'var(--brand-500)' }}>✦</span>
          <span className="font-semibold text-sm tracking-wide" style={{ color: 'var(--neutral-900)' }}>
            Group Date
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--neutral-600)',
                background: isActive ? 'var(--brand-50)' : 'transparent',
              }}
            >
              <span className="w-5 text-center text-base" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium truncate" style={{ color: 'var(--neutral-700)' }}>
            {userEmail}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Organizer</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void signOut()
          }}
        >
          <button
            id="nav-logout"
            type="submit"
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            style={{ color: 'var(--neutral-500)' }}
          >
            <span className="w-5 text-center text-base" aria-hidden="true">🚪</span>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
