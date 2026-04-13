"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export function Navbar({ role = 'renter' }: { role?: string }) {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-2xl tracking-tighter text-slate-900 hover:text-slate-800 transition-colors">
          RentO
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/explore" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            Explore
          </Link>
          {!isLoaded ? null : isSignedIn ? (
            <div className="flex items-center gap-3">
              {role === 'lender' && (
                <Link href="/items/add">
                  <Button className="rounded-full px-5 h-10 font-bold shadow-sm hover:shadow-md transition-all bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-1" strokeWidth={3} />
                    List Item
                  </Button>
                </Link>
              )}
              <div className="flex items-center justify-center flex-shrink-0 ml-1">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }}>
                  <UserButton.MenuItems>
                    <UserButton.Link label="Dashboard" href="/dashboard" labelIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                    } />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button variant="outline" className="rounded-full px-6 h-10 font-bold shadow-sm hover:shadow-md transition-all border-slate-200 text-slate-700 hover:bg-slate-50">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}