import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizerNav } from '@/components/organizer-nav'

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Belt-and-suspenders auth check (proxy.ts handles it at the edge,
  // but we also verify server-side for security)
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--neutral-50)' }}>
      {/* Sidebar Nav */}
      <OrganizerNav userEmail={user.email ?? ''} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
