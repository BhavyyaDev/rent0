'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { updateUserName, getAccountData, deleteAccount } from '@/app/actions/user';
import Link from 'next/link';
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  Package,
  ChevronRight,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Bell,
  CreditCard,
} from 'lucide-react';

export default function AccountPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbUser,            setDbUser]            = useState<any>(null);
  const [name,              setName]              = useState('');
  const [toast,             setToast]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showDeleteDialog,  setShowDeleteDialog]  = useState(false);
  const [isPending,         startTransition]      = useTransition();
  const [isDeleting,        startDeleteTransition] = useTransition();

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push('/sign-in');
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn && user) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.fullName || user.firstName || '');
      getAccountData().then(setDbUser);
    }
  }, [isSignedIn, user]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateUserName(name);
      if (res?.error) showToast('error', res.error);
      else showToast('success', 'Profile updated successfully!');
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const res = await deleteAccount();
      if (res?.error) {
        showToast('error', res.error);
        setShowDeleteDialog(false);
      } else {
        await signOut();
        router.push('/');
      }
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4f07a]" />
      </div>
    );
  }

  if (!isSignedIn) return null;

  const avatarInitial = (user?.fullName || user?.firstName || 'U').charAt(0).toUpperCase();
  const email         = user?.primaryEmailAddress?.emailAddress || '';
  const role          = dbUser?.role || 'renter';
  const memberSince   = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-[#f9f9f9] relative overflow-x-hidden pb-24">

      {/* ── Background orbs ───────────────────────────────────── */}
      <div
        className="orb w-[500px] h-[500px] bg-[#d4f07a]"
        style={{ top: '-100px', right: '-100px', opacity: 0.12, filter: 'blur(120px)' }}
      />
      <div
        className="orb w-[400px] h-[400px] bg-pink-200"
        style={{ bottom: '20%', left: '-80px', opacity: 0.12, filter: 'blur(120px)' }}
      />

      {/* ── Toast ─────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-3 duration-300 ${
            toast.type === 'success'
              ? 'bg-[#d4f07a] text-[#1a1a1a]'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="font-bold text-sm">{toast.msg}</p>
        </div>
      )}

      <main className="pt-8 pb-20 px-6 md:px-8 max-w-[1440px] mx-auto">

        {/* ── Breadcrumbs ───────────────────────────────────────── */}
        <nav className="glass-panel w-fit px-6 py-2 rounded-full mb-12">
          <ol className="flex items-center gap-1 text-[12px] font-semibold text-gray-500">
            <li><Link href="/" className="hover:text-[#d4f07a] transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link href="/dashboard" className="hover:text-[#d4f07a] transition-colors">Dashboard</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-[#d4f07a] font-bold">Account</li>
          </ol>
        </nav>

        {/* ── Page title ────────────────────────────────────────── */}
        <div className="mb-14">
          <h1 className="text-[48px] md:text-[64px] font-extrabold text-[#1a1c1c] tracking-[-0.04em] leading-[1.05]">
            Account
          </h1>
          <p className="text-gray-500 text-lg font-medium mt-3 max-w-lg leading-relaxed">
            Manage your profile, preferences, and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* ══════════ LEFT: Profile sidebar ══════════ */}
          <div className="lg:col-span-4">
            <div className="glass-panel rounded-3xl p-8 sticky top-[100px]">

              {/* Avatar + identity */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-5">
                  <div className="w-28 h-28 rounded-full ring-4 ring-[#d4f07a] ring-offset-4 ring-offset-transparent overflow-hidden bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-4xl">{avatarInitial}</span>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#d4f07a] rounded-full flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1a1a1a]" />
                  </div>
                </div>

                <h2 className="text-2xl font-black text-[#1a1c1c] tracking-tight">
                  {user?.fullName || name || 'User'}
                </h2>
                <p className="text-sm text-gray-400 font-medium mt-1 truncate max-w-[220px]">{email}</p>

                {/* Role badge */}
                <span className={`mt-3 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                  role === 'lender'
                    ? 'bg-[#d4f07a] text-[#1a1a1a]'
                    : 'bg-[#1a1a1a] text-white'
                }`}>
                  {role}
                </span>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 mb-7">
                <div className="glass-panel rounded-2xl p-4 text-center">
                  <Package className="w-5 h-5 text-[#d4f07a] mx-auto mb-1.5" />
                  <p className="text-2xl font-black text-[#1a1c1c]">{dbUser?.itemsCount ?? '—'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Listings</p>
                </div>
                <div className="glass-panel rounded-2xl p-4 text-center">
                  <ShoppingBag className="w-5 h-5 text-[#d4f07a] mx-auto mb-1.5" />
                  <p className="text-2xl font-black text-[#1a1c1c]">{dbUser?.requestsCount ?? '—'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Rentals</p>
                </div>
              </div>

              {/* Member since */}
              <div className="flex items-center justify-center gap-2 mb-7 text-sm text-gray-400 font-medium">
                <Calendar className="w-4 h-4" />
                Member since {dbUser?.createdAt ? new Date(dbUser.createdAt).getFullYear() : '—'}
              </div>

              <div className="h-px bg-gray-100 mb-6" />

              {/* Sidebar nav */}
              <nav className="space-y-1 mb-6">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] text-white rounded-2xl font-bold text-sm cursor-default">
                  <User className="w-4 h-4 text-[#d4f07a]" />
                  Profile
                </div>
                {[
                  { icon: Shield,      label: 'Security' },
                  { icon: CreditCard,  label: 'Payments' },
                  { icon: Bell,        label: 'Notifications' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-colors cursor-default"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                ))}
              </nav>

              <div className="h-px bg-gray-100 mb-6" />

              {/* Sign Out */}
              <button
                onClick={() => signOut(() => router.push('/'))}
                className="w-full border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold text-sm py-3 rounded-full hover:bg-[#1a1a1a] hover:text-white transition-all flex items-center justify-center gap-2 mb-3 active:scale-95 duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

              {/* Delete Account */}
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full border-2 border-red-300 text-red-500 font-bold text-sm py-3 rounded-full hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95 duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>

          {/* ══════════ RIGHT: Forms ══════════ */}
          <div className="lg:col-span-8 space-y-8">

            {/* ─── Profile Information ─── */}
            <div className="glass-panel rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center text-[#1a1a1a] font-black flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-extrabold text-[#1a1c1c] tracking-tight">Profile Information</h2>
              </div>

              <div className="space-y-5">

                {/* Display name */}
                <div className="space-y-2">
                  <label className="text-[#1a1c1c] font-semibold text-sm block">
                    Display Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                    className="apple-input w-full h-14 px-5 rounded-2xl text-base"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label className="text-[#1a1c1c] font-semibold text-sm flex items-center gap-2">
                    Email Address
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                      Managed by Clerk
                    </span>
                  </label>
                  <input
                    value={email}
                    readOnly
                    className="apple-input w-full h-14 px-5 rounded-2xl text-base opacity-60 cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-[#1a1c1c] font-semibold text-sm flex items-center gap-2">
                    Current Role
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                      Switch from Dashboard
                    </span>
                  </label>
                  <div className="apple-input h-14 px-5 rounded-2xl flex items-center justify-between opacity-70 cursor-not-allowed">
                    <span className="text-base text-[#1a1c1c] font-medium capitalize">{role}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      role === 'lender' ? 'bg-[#d4f07a] text-[#1a1a1a]' : 'bg-[#1a1a1a] text-white'
                    }`}>
                      {role}
                    </span>
                  </div>
                </div>

                {/* Member since */}
                <div className="space-y-2">
                  <label className="text-[#1a1c1c] font-semibold text-sm block">Member Since</label>
                  <div className="apple-input h-14 px-5 rounded-2xl flex items-center opacity-60 cursor-not-allowed">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-base text-[#1a1c1c]">{memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-8">
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="w-full bg-[#d4f07a] text-[#1a1a1a] font-black text-base py-4 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* ─── Security ─── */}
            <div className="glass-panel rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center text-[#1a1a1a] flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-extrabold text-[#1a1c1c] tracking-tight">Security</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 glass-panel rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#d4f07a]/20 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-[#526600]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1c1c] text-sm">Identity Verification</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Managed by Clerk</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-wider flex-shrink-0">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 glass-panel rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#d4f07a]/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#526600]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1c1c] text-sm">Email Verified</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5 truncate max-w-[200px]">{email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-wider flex-shrink-0">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 glass-panel rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1c1c] text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Add extra security to your account</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full uppercase tracking-wider flex-shrink-0">
                    Off
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Secured by Clerk note ─── */}
            <div className="flex items-center justify-between glass-panel rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Identity & auth secured by Clerk
                </p>
              </div>
              <div className="flex items-center gap-1.5 opacity-50">
                <Shield className="w-3 h-3 text-gray-400" />
                <span className="text-[11px] font-bold text-gray-400">Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Delete Account Confirmation Dialog ────────────────── */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          />
          <div className="relative glass-panel bg-white/80 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>

            <h3 className="text-xl font-black text-[#1a1c1c] tracking-tight mb-2">Delete Account?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              This is permanent and cannot be undone. All your listings, rental history, and personal data will be removed from RentO immediately.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-full active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="w-full border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-full hover:bg-gray-50 transition-colors active:scale-95"
              >
                Keep My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[#2f3131] text-[#f1f1f1] py-20 mt-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-[#d4f07a] font-bold text-[24px] tracking-tight mb-6">RentO</div>
              <p className="text-[16px] text-[#c8c6c5] max-w-xs leading-relaxed">
                The world&apos;s premium marketplace for professional gear sharing.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-12">
              {[
                { title: 'Platform', links: ['About Us', 'Safety First', 'Careers'] },
                { title: 'Legal',    links: ['Terms of Service', 'Privacy Policy', 'Refund Policy'] },
                { title: 'Support',  links: ['Help Center', 'Safety Guide', 'Contact Us'] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <h5 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
                    {col.title}
                  </h5>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-[14px] text-[#c8c6c5] hover:text-[#d4f07a] transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[12px] text-[#c8c6c5]">© 2025 RentO Marketplace. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-[#d4f07a] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#d4f07a] transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
