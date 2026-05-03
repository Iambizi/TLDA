import { OrganizerNav } from '@/components/organizer-nav'

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protection is handled by middleware at the edge

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--neutral-50)' }}>
      {/* Sidebar Nav */}
      <OrganizerNav />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
