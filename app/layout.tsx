import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/navbar'
import { Geist, Geist_Mono } from 'next/font/google'
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
  let globalRole = 'renter';
  const user = await currentUser();
  
  if (user) {
    const dbUser = await (prisma as any).user.findUnique({ where: { id: user.id } });
    if (dbUser?.role) {
      globalRole = dbUser.role;
    }
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <Navbar role={globalRole} />
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}