import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/navbar'
import { Geist, Geist_Mono } from 'next/font/google'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { syncUser } from '@/lib/syncUser'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RentO - Rent anything, anytime',
  description: 'Premium rental marketplace',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let globalRole = 'guest';
  const user = await currentUser();

  if (user) {
    const dbUser = (await syncUser()) as any;
    if (dbUser?.role) {
      globalRole = dbUser.role;
    } else {
      globalRole = 'renter'; // fallback
    }
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F8FAFC] min-h-screen`}>
        <ClerkProvider>
          <Navbar role={globalRole} />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  )
}