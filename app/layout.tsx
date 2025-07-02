import { Inter } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from '@/components/auth/auth-provider'
import { UserProfileHeader } from "@/components/user-profile-header"
import '@/lib/pdf-config'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "ClockMeIn - Time Tracking",
  description: "Simple and effective time tracking for professionals",
  icons: {
    icon: '/1.svg',
    shortcut: '/1.svg',
    apple: '/1.svg',
    other: {
      rel: 'icon',
      url: '/1.svg',
      type: 'image/svg+xml'
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
