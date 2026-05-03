import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Group Date — Singles Event Platform',
    template: '%s | Group Date',
  },
  description:
    'Organizer-first internal platform for managing singles event applications, rosters, and match coordination.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={inter.variable}>
        <body>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
