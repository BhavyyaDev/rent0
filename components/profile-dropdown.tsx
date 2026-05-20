'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  User, LayoutGrid, Package, Plus, HelpCircle, LogOut, ChevronRight,
} from 'lucide-react';

type Props = { role?: string };

const MENU_ITEMS = [
  { label: 'My Account',    href: '/account',    icon: User },
  { label: 'My Rentals',    href: '/dashboard',  icon: Package },
  { label: 'My Listings',   href: '/dashboard',  icon: LayoutGrid },
  { label: 'List Your Gear', href: '/items/add', icon: Plus },
  { label: 'Help & Support', href: '#',          icon: HelpCircle },
] as const;

export function ProfileDropdown({ role = 'renter' }: Props) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Skeleton while Clerk loads
  if (!isLoaded) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  // Signed-out state
  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="bg-[#d4f07a] text-[#1a1a1a] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#c8e86e] hover:scale-105 active:scale-95 transition-all shadow-sm shadow-[#d4f07a]/30"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const name = user.fullName || user.username || 'User';
  const email = user.primaryEmailAddress?.emailAddress || '';
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div ref={containerRef} className="relative">
      {/* ── Avatar trigger ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d4f07a] ring-2 ring-transparent hover:ring-[#d4f07a]/40 focus:ring-[#d4f07a]/50 transition-all duration-300 flex-shrink-0 focus:outline-none"
      >
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-[#d4f07a] text-sm font-black">
            {initials}
          </div>
        )}
      </button>

      {/* ── Dropdown panel ─────────────────────────────────────── */}
      <div
        role="menu"
        aria-label="User menu"
        className={[
          'absolute right-0 mt-3 w-72 rounded-3xl overflow-hidden z-[60] origin-top-right',
          // Mobile: full width pinned to viewport edges
          'max-md:fixed max-md:left-3 max-md:right-3 max-md:w-auto',
          open
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none',
        ].join(' ')}
        style={{
          background: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(212,240,122,0.12)',
          transition: 'opacity 0.2s cubic-bezier(0.4,0,0.2,1), transform 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* User header */}
        <div className="p-5 flex items-center gap-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#d4f07a] flex-shrink-0">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-[#d4f07a] font-black">
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-[#1a1c1c] text-sm leading-tight truncate">{name}</span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                  role === 'lender'
                    ? 'bg-[#d4f07a] text-[#3d4d00]'
                    : 'bg-[#1a1a1a] text-white'
                }`}
              >
                {role === 'lender' ? 'Lender' : 'Renter'}
              </span>
            </div>
            <span className="text-xs text-gray-400 truncate block">{email}</span>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-2">
          {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[#1a1c1c] hover:bg-[#d4f07a]/15 active:bg-[#d4f07a]/30 transition-all duration-150 group"
            >
              <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#526600] transition-colors flex-shrink-0" />
              <span className="text-sm font-semibold flex-1">{label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#526600] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-gray-100" />

        {/* Sign out */}
        <div className="p-2">
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.push('/');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-all duration-150 group"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors flex-shrink-0" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-gray-50/60 border-t border-gray-100">
          <span className="text-[10px] text-gray-300 font-semibold tracking-wide">
            Secured by Clerk
          </span>
        </div>
      </div>
    </div>
  );
}
