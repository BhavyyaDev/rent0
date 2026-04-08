"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-2xl tracking-tighter text-slate-900 hover:text-slate-800 transition-colors">
          RentO
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/explore" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            Explore
          </Link>
          {!isLoaded ? null : isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors mr-2">
                Dashboard
              </Link>
              <Link href="/items/add">
                <Button className="rounded-full px-5 h-10 font-bold shadow-sm hover:shadow-md transition-all bg-slate-900 text-white hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-1" strokeWidth={3} />
                  Add Item
                </Button>
              </Link>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
              </div>
            </>
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