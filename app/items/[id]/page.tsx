import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Camera, ChevronRight, BadgeCheck } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { BookingWidget } from '@/components/booking-widget';
import { syncRequestStatuses } from '@/app/actions/request';

export const dynamic = 'force-dynamic';

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Sync all request statuses for accuracy
  await syncRequestStatuses();

  const item = await prisma.item.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!item) notFound();

  // Fetch accepted date ranges to disable in calendar
  const acceptedRequests = await (prisma as any).request.findMany({
    where: { itemId: id, status: 'accepted' },
    select: { startDate: true, endDate: true },
  });

  const bookedRanges = acceptedRequests.map((req: any) => ({
    from: req.startDate.toISOString(),
    to: req.endDate.toISOString(),
  }));

  // Owner vs renter check
  const clerkUser = await currentUser();
  let isOwner = false;
  if (clerkUser) {
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (email) {
      const dbUser = await prisma.user.findUnique({ where: { email } });
      isOwner = dbUser?.id === item.ownerId;
    }
  }

  const ownerInitial = item.owner?.name?.charAt(0).toUpperCase() ?? 'U';
  const memberYear = item.owner?.createdAt
    ? new Date(item.owner.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#f9f9f9] relative overflow-x-hidden pb-28 md:pb-0">

      {/* ── Background orbs ───────────────────────────────────── */}
      <div
        className="orb w-[500px] h-[500px] bg-[#d4f07a]"
        style={{ top: '-100px', right: '-100px', opacity: 0.15, filter: 'blur(120px)' }}
      />
      <div
        className="orb w-[400px] h-[400px] bg-pink-200"
        style={{ bottom: '20%', left: '-100px', opacity: 0.15, filter: 'blur(120px)' }}
      />

      <main className="pt-8 pb-20 px-8 max-w-[1440px] mx-auto">

        {/* ── Breadcrumbs ───────────────────────────────────────── */}
        <nav className="glass-panel w-fit px-6 py-2 rounded-full mb-12">
          <ol className="flex items-center gap-1 text-[12px] font-semibold text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#d4f07a] transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li>
              <Link
                href={`/search?category=${item.category?.toLowerCase() ?? ''}`}
                className="hover:text-[#d4f07a] transition-colors"
              >
                {item.category ?? 'Equipment'}
              </Link>
            </li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-[#d4f07a] font-bold">{item.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative">

          {/* ── Left Column: Gallery & Details ────────────────── */}
          <div className="md:col-span-8 space-y-12">

            {/* Image Gallery */}
            <div className="relative group aspect-video w-full rounded-[24px] overflow-hidden bg-gray-100">
              <Link
                href="/explore"
                className="absolute top-6 left-6 z-20 w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>

              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Camera className="w-10 h-10 text-gray-300" />
                  </div>
                  <span className="font-bold text-lg">No image available</span>
                </div>
              )}

              {/* Hover-reveal gallery nav (decorative — single image) */}
              <button className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                <ChevronRight className="w-5 h-5 rotate-180 text-gray-700" />
              </button>
              <button className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Item Info */}
            <div className="space-y-6">

              {/* Category badges */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#d4f07a] text-[#3d4d00] font-bold text-[10px] rounded-full tracking-wider uppercase">
                  Pro Gear
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 font-bold text-[10px] rounded-full uppercase">
                  {item.category ?? 'Equipment'}
                </span>
              </div>

              <h1 className="text-[48px] font-bold text-[#1a1c1c] tracking-tight leading-[1.1] uppercase">
                {item.title}
              </h1>

              <div className="h-px w-full bg-gray-200" />

              {/* Lender profile */}
              <div className="flex items-center gap-6 py-2">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-bold text-2xl">
                    {ownerInitial}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-[2px] shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-[#d4f07a]" />
                  </div>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-600">
                    Lended by{' '}
                    <span className="font-bold text-[#1a1c1c]">{item.owner?.name ?? 'Owner'}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[12px] text-[#526600] font-semibold flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-[#d4f07a]" /> Verified Identity
                    </span>
                    <span className="text-gray-400 text-[12px]">• Member since {memberYear}</span>
                    <span className="bg-[#d4f07a]/30 px-2 py-0.5 rounded-full text-[12px] font-bold text-[#3d4d00]">
                      Trust {(item.owner as any)?.trustScore ?? 100}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gray-200" />

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-[24px] font-bold text-[#1a1c1c]">Description</h3>
                <p className="text-[16px] text-gray-500 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Feature bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div className="glass-panel p-6 rounded-[24px] flex items-start gap-6 hover:border-[#d4f07a] transition-colors cursor-default group">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#d4f07a] transition-colors flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-gray-700 group-hover:text-[#3d4d00] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#1a1c1c]">Damage Protection</h4>
                    <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                      Your rental is secured with our damage protection plan.
                    </p>
                  </div>
                </div>
                <div className="glass-panel p-6 rounded-[24px] flex items-start gap-6 hover:border-[#d4f07a] transition-colors cursor-default group">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#d4f07a] transition-colors flex-shrink-0">
                    <Camera className="w-6 h-6 text-gray-700 group-hover:text-[#3d4d00] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#1a1c1c]">Verified Listing</h4>
                    <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                      All gear photos are verified before they go live on RentO.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Booking Widget / Owner Edit ──────── */}
          <div className="md:col-span-4">
            <aside className="sticky top-[100px] space-y-6">

              {isOwner ? (
                /* Owner view */
                <div className="glass-panel lime-glow p-8 rounded-[32px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    You own this item
                  </p>
                  <h3 className="text-[24px] font-bold text-[#1a1c1c] mb-6">Manage Listing</h3>
                  <Link href={`/items/${item.id}/edit`} className="block">
                    <button className="w-full py-4 bg-[#d4f07a] text-[#1a1a1a] font-bold text-lg rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all">
                      Edit Listing
                    </button>
                  </Link>
                  <Link href="/dashboard" className="block mt-3">
                    <button className="w-full py-3 bg-transparent border border-gray-200 text-gray-600 font-semibold text-sm rounded-full hover:bg-gray-50 transition-colors">
                      View Dashboard
                    </button>
                  </Link>
                </div>
              ) : (
                /* Renter view */
                <>
                  <BookingWidget
                    itemId={item.id}
                    itemTitle={item.title}
                    pricePerDay={item.pricePerDay}
                    bookedRanges={bookedRanges}
                  />

                  {/* RentO Guarantee */}
                  <div className="glass-panel p-6 rounded-[24px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#d4f07a] flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#3d4d00]" />
                      </div>
                      <span className="text-[14px] font-semibold text-[#1a1c1c]">RentO Guarantee</span>
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      Experience worry-free rentals with our comprehensive gear inspection and verified user community.
                    </p>
                  </div>
                </>
              )}

              {/* Secure checkout note */}
              <div className="flex items-center justify-center gap-2 opacity-60">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  100% Secure Checkout
                </span>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ── Mobile fixed bottom bar (renter only) ─────────────── */}
      {!isOwner && (
        <div className="md:hidden fixed bottom-2 left-2 right-2 z-50 glass-panel rounded-[28px] p-5 flex items-center justify-between shadow-2xl">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#1a1c1c] tracking-tighter">
              ₹{item.pricePerDay.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">/ per day</span>
          </div>
          <div className="w-[180px]">
            <BookingWidget
              itemId={item.id}
              itemTitle={item.title}
              pricePerDay={item.pricePerDay}
              bookedRanges={bookedRanges}
            />
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[#2f3131] text-[#f1f1f1] py-20">
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
                { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Refund Policy'] },
                { title: 'Support', links: ['Help Center', 'Safety Guide', 'Contact Us'] },
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
