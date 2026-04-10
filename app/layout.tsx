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
  let globalRole = 'onboarding';
  const user = await currentUser();
  const headerList = await headers();
  const rawUrl = headerList.get('x-url') || '';
  const pathname = rawUrl ? new URL(rawUrl).pathname : '';

  if (user) {
    // Sync the user to ensure they exist in DB
    const dbUser = (await syncUser()) as any;
    if (dbUser?.role) {
      globalRole = dbUser.role;
    }

    // Force onboarding if role is still "onboarding" and we are not already on the onboarding page
    if (globalRole === 'onboarding' && pathname !== '/onboarding') {
      redirect('/onboarding');
    }
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          {/* Hide Navbar during onboarding for a cleaner focused experience */}
          {globalRole !== 'onboarding' && <Navbar role={globalRole} />}
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}