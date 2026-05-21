'use client';

import { useActionState, useState } from 'react';
import { Label } from '@/components/ui/label';
import { createItem } from '@/app/actions/item';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Camera,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { value: 'camera',   label: 'Camera' },
  { value: 'audio',    label: 'Audio' },
  { value: 'gaming',   label: 'Gaming' },
  { value: 'tech',     label: 'Tech' },
  { value: 'other',    label: 'Other' },
];

const TIPS = [
  'Use a clear, bright photo showing the full item',
  'Price competitively — check similar listings first',
  "Describe condition, what's included, and any rules",
  'Set realistic availability so renters can plan ahead',
];

export default function AddItemPage() {
  const [state, formAction, pending] = useActionState(createItem, null);

  const [previewTitle,    setPreviewTitle]    = useState('');
  const [previewPrice,    setPreviewPrice]    = useState('');
  const [previewImage,    setPreviewImage]    = useState('');
  const [previewCategory, setPreviewCategory] = useState('');
  const [imgError,        setImgError]        = useState(false);

  if (state?.success) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-6 relative overflow-hidden">
        <div
          className="orb absolute w-[500px] h-[500px] bg-[#d4f07a]"
          style={{ top: '-120px', right: '-100px', opacity: 0.15, filter: 'blur(120px)' }}
        />
        <div className="glass-panel rounded-3xl p-12 max-w-md w-full text-center relative z-10">
          <div className="w-20 h-20 bg-[#d4f07a] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#1a1a1a]" />
          </div>
          <h2 className="text-3xl font-black text-[#1a1c1c] tracking-tight mb-3">
            Listed Successfully!
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Your item is now live and available for others to rent.
          </p>
          <Link href={`/items/${state.itemId}`}>
            <button className="w-full bg-[#d4f07a] text-[#1a1a1a] font-black text-base py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md">
              View Your Listing
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full mt-3 text-sm font-semibold text-gray-400 hover:text-[#526600] transition-colors py-2">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] relative overflow-x-hidden pb-24">

      {/* ── Background orbs ───────────────────────────────────── */}
      <div
        className="orb absolute w-[500px] h-[500px] bg-[#d4f07a]"
        style={{ top: '-100px', right: '-100px', opacity: 0.15, filter: 'blur(120px)' }}
      />
      <div
        className="orb absolute w-[400px] h-[400px] bg-pink-200"
        style={{ bottom: '20%', left: '-100px', opacity: 0.15, filter: 'blur(120px)' }}
      />

      <main className="pt-8 pb-20 px-6 md:px-8 max-w-[1440px] mx-auto">

        {/* ── Breadcrumbs ───────────────────────────────────────── */}
        <nav className="glass-panel w-fit px-6 py-2 rounded-full mb-12">
          <ol className="flex items-center gap-1 text-[12px] font-semibold text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#d4f07a] transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li>
              <Link href="/dashboard" className="hover:text-[#d4f07a] transition-colors">Dashboard</Link>
            </li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-[#d4f07a] font-bold">List New Gear</li>
          </ol>
        </nav>

        {/* ── Page title ────────────────────────────────────────── */}
        <div className="mb-14">
          <h1 className="text-[48px] md:text-[64px] font-extrabold text-[#1a1c1c] tracking-[-0.04em] leading-[1.05]">
            List Your<br />
            <span className="text-[#d4f07a]">Gear</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium mt-4 max-w-lg leading-relaxed">
            Share your equipment with the community and start earning from every rental.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* ══════════ LEFT: Form ══════════ */}
          <div className="lg:col-span-7">

            {/* Error banner */}
            {state?.error && (
              <div className="bg-red-50 text-red-700 p-5 rounded-2xl flex items-start gap-4 mb-8 border border-red-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-bold text-sm leading-relaxed">{state.error}</p>
              </div>
            )}

            <form action={formAction} className="space-y-8">

              {/* ─── Section 1: Item Details ─── */}
              <div className="glass-panel rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center text-[#1a1a1a] font-black text-sm flex-shrink-0">
                    1
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1a1c1c] tracking-tight">Item Details</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[#1a1c1c] font-semibold text-sm">
                      Listing Title
                    </Label>
                    <input
                      id="title"
                      name="title"
                      required
                      placeholder="e.g. Sony A7III Mirrorless Camera"
                      onChange={(e) => setPreviewTitle(e.target.value)}
                      className="apple-input w-full h-14 px-5 rounded-2xl text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[#1a1c1c] font-semibold text-sm">
                      Category
                    </Label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        required
                        defaultValue=""
                        onChange={(e) => setPreviewCategory(e.target.value)}
                        className="apple-input w-full h-14 px-5 rounded-2xl text-base appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Section 2: Photos ─── */}
              <div className="glass-panel rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center text-[#1a1a1a] font-black text-sm flex-shrink-0">
                    2
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1a1c1c] tracking-tight">Photos</h2>
                </div>

                {/* Upload zone (decorative) */}
                <div className="border-2 border-dashed border-gray-200 hover:border-[#d4f07a] rounded-3xl p-10 text-center transition-all group mb-5 cursor-default">
                  <div className="w-16 h-16 rounded-full bg-[#d4f07a]/20 group-hover:bg-[#d4f07a]/40 flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Upload className="w-7 h-7 text-[#526600]" />
                  </div>
                  <p className="font-bold text-[#1a1c1c] text-base mb-1">Paste your image URL below</p>
                  <p className="text-gray-400 text-sm">High-quality photos get 3× more bookings</p>
                </div>

                <div className="space-y-2 mb-5">
                  <Label htmlFor="imageUrl" className="text-[#1a1c1c] font-semibold text-sm">
                    Image URL{' '}
                    <span className="text-gray-400 font-normal">— Optional</span>
                  </Label>
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    onChange={(e) => { setPreviewImage(e.target.value); setImgError(false); }}
                    className="apple-input w-full h-14 px-5 rounded-2xl text-base"
                  />
                </div>

                {/* Thumbnail placeholders */}
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden"
                    >
                      {i === 0 && previewImage && !imgError ? (
                        <img
                          src={previewImage}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Section 3: Pricing ─── */}
              <div className="glass-panel rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center text-[#1a1a1a] font-black text-sm flex-shrink-0">
                    3
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1a1c1c] tracking-tight">Pricing</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerDay" className="text-[#1a1c1c] font-semibold text-sm">
                      Price per day (₹)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base pointer-events-none select-none">
                        ₹
                      </span>
                      <input
                        id="pricePerDay"
                        name="pricePerDay"
                        type="number"
                        step="0.01"
                        min="1"
                        required
                        placeholder="0.00"
                        onChange={(e) => setPreviewPrice(e.target.value)}
                        className="apple-input w-full h-14 pl-9 pr-5 rounded-2xl text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit" className="text-[#1a1c1c] font-semibold text-sm">
                      Security deposit (₹){' '}
                      <span className="text-gray-400 font-normal">Optional</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base pointer-events-none select-none">
                        ₹
                      </span>
                      <input
                        id="deposit"
                        name="deposit"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="apple-input w-full h-14 pl-9 pr-5 rounded-2xl text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Section 4: Description ─── */}
              <div className="glass-panel rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center text-[#1a1a1a] font-black text-sm flex-shrink-0">
                    4
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1a1c1c] tracking-tight">Description</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#1a1c1c] font-semibold text-sm">
                    Tell renters about your gear
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={5}
                    placeholder="Describe your item's condition, what's included, pickup instructions, and any restrictions..."
                    className="apple-input w-full px-5 py-4 rounded-2xl text-base resize-none"
                  />
                </div>
              </div>

              {/* ─── Section 5: Availability ─── */}
              <div className="glass-panel rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center text-[#1a1a1a] font-black text-sm flex-shrink-0">
                    5
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1a1c1c] tracking-tight">Availability</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom" className="text-[#1a1c1c] font-semibold text-sm">
                      Available from
                    </Label>
                    <input
                      id="availableFrom"
                      name="availableFrom"
                      type="date"
                      className="apple-input w-full h-14 px-5 rounded-2xl text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableTo" className="text-[#1a1c1c] font-semibold text-sm">
                      Available until
                    </Label>
                    <input
                      id="availableTo"
                      name="availableTo"
                      type="date"
                      className="apple-input w-full h-14 px-5 rounded-2xl text-base"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Submit ─── */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-[#d4f07a] text-[#1a1a1a] font-black text-lg py-5 rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {pending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                  ) : (
                    'Publish Listing'
                  )}
                </button>
                <button
                  type="button"
                  className="w-full text-gray-400 font-semibold text-sm hover:text-[#526600] transition-colors py-2"
                >
                  Save as Draft
                </button>
              </div>
            </form>
          </div>

          {/* ══════════ RIGHT: Preview + Tips ══════════ */}
          <div className="lg:col-span-5">
            <div className="sticky top-[100px] space-y-6">

              {/* Live Preview */}
              <div className="glass-panel rounded-3xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">
                  Live Preview
                </p>

                <div className="product-card-hover rounded-3xl overflow-hidden group">
                  {/* Image */}
                  <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {previewImage && !imgError ? (
                      <img
                        src={previewImage}
                        alt="Listing preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                          <Camera className="w-7 h-7 text-gray-400" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400">Add a photo to preview</span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-[#d4f07a] text-[#3d4d00] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Pro Gear
                      </span>
                      {previewCategory && (
                        <span className="bg-[#1a1a1a]/70 backdrop-blur-sm text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {previewCategory}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-[#1a1c1c] text-base line-clamp-1 tracking-tight">
                      {previewTitle || <span className="text-gray-300">Your listing title</span>}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d4f07a]" />
                      <span className="text-xs text-gray-400 font-medium">Verified · Trust 100%</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="font-black text-xl text-[#1a1c1c] tracking-tighter">
                        {previewPrice
                          ? `₹${parseFloat(previewPrice).toLocaleString()}`
                          : <span className="text-gray-300">₹—</span>
                        }
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">/ day</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 text-center mt-4 font-medium">
                  This is how your listing appears on the Explore page
                </p>
              </div>

              {/* Tips card */}
              <div className="bg-[#d4f07a] rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a]/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-[#1a1a1a]" />
                  </div>
                  <h3 className="font-extrabold text-[#1a1a1a] text-base">Tips for a great listing</h3>
                </div>
                <ul className="space-y-3">
                  {TIPS.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#1a1a1a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-black text-[#1a1a1a]">{i + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-[#1a1a1a]/80 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Seller Protection */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#3d4d00]" />
                  </div>
                  <span className="font-semibold text-[#1a1c1c] text-sm">RentO Seller Protection</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Every rental is backed by our damage protection policy. List with confidence — you're covered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[#2f3131] text-[#f1f1f1] py-20 mt-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-[#d4f07a] font-bold text-[24px] tracking-tight mb-6">RentO</div>
              <p className="text-[16px] text-[#c8c6c5] max-w-xs leading-relaxed">
                The world's premium marketplace for professional gear sharing.
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
