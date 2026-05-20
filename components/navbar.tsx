"use client";

import Link from 'next/link';
import { ProfileDropdown } from '@/components/profile-dropdown';

export function Navbar({ role = 'renter' }: { role?: string }) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 h-16 flex items-center justify-between">
        {/* Left: logo + nav links */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-black text-2xl tracking-tighter text-[#1a1a1a] hover:text-[#526600] transition-colors"
          >
            RentO
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/explore"
              className="text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/items/add"
              className="text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors"
            >
              List Your Gear
            </Link>
          </div>
        </div>

        {/* Right: profile dropdown (handles signed-in + signed-out states) */}
        <ProfileDropdown role={role} />
      </div>
    </nav>
  );
}
