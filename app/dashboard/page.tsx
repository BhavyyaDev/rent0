import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardItemCard } from '@/components/dashboard-item-card';
import { RequestActionButtons } from '@/components/request-action-buttons';
import Link from 'next/link';
import {
  PlusCircle,
  ShoppingBag,
  Package,
  Activity,
  Banknote,
  Search,
  ShieldCheck,
  Camera,
  Clock,
  Star,
} from 'lucide-react';
import { Item } from '@/components/item-card';
import { RoleToggle } from '@/components/role-toggle';
import { syncRequestStatuses } from '@/app/actions/request';
import { EditRequestModal } from '@/components/edit-request-modal';
import { DeleteRequestButton } from '@/components/delete-request-button';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'all' } = await searchParams;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  await syncRequestStatuses();

  const currentUser = await (prisma as any).user.findUnique({ where: { id: userId } });
  const role = currentUser?.role || 'renter';

  const rawItems = await prisma.item.findMany({
    where: { ownerId: userId },
    include: {
      owner: true,
      requests: { where: { status: 'accepted', endDate: { gte: new Date() } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  const items = rawItems as unknown as Item[];

  const incomingRequests = await (prisma as any).request.findMany({
    where: { item: { ownerId: userId } },
    include: { item: true, renter: true },
    orderBy: { createdAt: 'desc' },
  });

  const outgoingRequests = await (prisma as any).request.findMany({
    where: { renterId: userId },
    include: { item: { include: { owner: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Lender stats
  const totalListings  = items.length;
  const activeListings = items.length;
  const estimatedValue = items.reduce((acc, item) => acc + item.pricePerDay * 10, 0);

  // Renter stats
  const totalRentals   = outgoingRequests.length;
  const activeRentals  = outgoingRequests.filter((r: any) => r.status === 'active').length;
  const pendingRentals = outgoingRequests.filter((r: any) => r.status === 'pending').length;

  // Status tab filtering
  const filteredRequests = tab === 'all'
    ? outgoingRequests
    : outgoingRequests.filter((req: any) => {
        if (tab === 'pending')   return req.status === 'pending' || req.status === 'accepted';
        if (tab === 'active')    return req.status === 'active';
        if (tab === 'completed') return req.status === 'completed' || req.status === 'rejected';
        return true;
      });

  // Recommended items (renter view)
  const recommended = await prisma.item.findMany({
    where: { ownerId: { not: userId } },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { owner: true },
  });

  const calcDays = (start: string, end: string) =>
    Math.ceil(Math.abs(new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24)) || 1;

  const daysRemaining = (end: string) =>
    // eslint-disable-next-line react-hooks/purity
    Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'pending')
      return { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
    if (status === 'accepted' && paymentStatus !== 'paid')
      return { label: 'Payment Due', cls: 'bg-orange-50 text-orange-700 border border-orange-200' };
    if (status === 'accepted' && paymentStatus === 'paid')
      return { label: 'Ready for Pickup', cls: 'bg-blue-50 text-blue-700 border border-blue-200' };
    if (status === 'active')
      return { label: 'Active', cls: 'bg-[#d4f07a]/20 text-[#3d4d00] border border-[#d4f07a]/50' };
    if (status === 'completed')
      return { label: 'Completed', cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
    if (status === 'rejected')
      return { label: 'Declined', cls: 'bg-red-50 text-red-600 border border-red-200' };
    return { label: status, cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
  };

  const TABS = [
    { label: 'All',       value: 'all' },
    { label: 'Pending',   value: 'pending' },
    { label: 'Active',    value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] relative overflow-x-hidden pb-24">

      {/* ── Background orbs ───────────────────────────────────── */}
      <div
        className="orb absolute w-[500px] h-[500px] bg-[#d4f07a]"
        style={{ top: '-120px', right: '-100px', opacity: 0.12, filter: 'blur(120px)' }}
      />
      <div
        className="orb absolute w-[400px] h-[400px] bg-blue-200"
        style={{ bottom: '10%', left: '-80px', opacity: 0.12, filter: 'blur(120px)' }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              {role === 'lender' ? 'Lender' : 'Renter'} Dashboard
            </p>
            <h1 className="text-6xl md:text-7xl font-extrabold text-[#1a1a1a] tracking-[-0.04em] mb-3">
              Dashboard
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed font-medium">
              {role === 'lender'
                ? 'Manage your inventory and fulfill incoming rental requests.'
                : 'Track the status of gear you want to rent from others.'}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <RoleToggle currentRole={role} />
            {role === 'lender' && (
              <Link href="/items/add">
                <button className="bg-[#d4f07a] text-[#1a1a1a] px-7 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md">
                  <PlusCircle className="w-4 h-4" /> List New Gear
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Lender stats ───────────────────────────────────── */}
        {role === 'lender' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass-panel lime-glow rounded-3xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#d4f07a]/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-7 h-7 text-[#526600]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Listings</p>
                <p className="text-4xl font-black text-[#1a1a1a]">{totalListings}</p>
              </div>
            </div>

            <div className="glass-panel lime-glow rounded-3xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-100/60 flex items-center justify-center flex-shrink-0">
                <Activity className="w-7 h-7 text-green-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Active Listings</p>
                <p className="text-4xl font-black text-[#1a1a1a]">{activeListings}</p>
              </div>
            </div>

            <div className="glass-panel lime-glow rounded-3xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#d4f07a]/20 flex items-center justify-center flex-shrink-0">
                <Banknote className="w-7 h-7 text-[#526600]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Estimated Value</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black text-[#1a1a1a]">₹{estimatedValue.toLocaleString()}</p>
                  <span className="text-sm font-bold text-gray-400">/mo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Renter stats ───────────────────────────────────── */}
        {role === 'renter' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass-panel lime-glow rounded-3xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#d4f07a]/20 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-7 h-7 text-[#526600]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Rentals</p>
                <p className="text-4xl font-black text-[#1a1a1a]">{totalRentals}</p>
              </div>
            </div>

            <div className="glass-panel lime-glow rounded-3xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-100/60 flex items-center justify-center flex-shrink-0">
                <Activity className="w-7 h-7 text-green-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Active Now</p>
                <p className="text-4xl font-black text-[#1a1a1a]">{activeRentals}</p>
              </div>
            </div>

            <div className="glass-panel lime-glow rounded-3xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pending</p>
                <p className="text-4xl font-black text-[#1a1a1a]">{pendingRentals}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-10 flex flex-col gap-20">

        {/* ════════════════ LENDER VIEW ════════════════ */}
        {role === 'lender' && (
          <>
            {/* Incoming Requests */}
            {incomingRequests.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
                    Incoming Bookings
                  </h2>
                  <span className="bg-[#d4f07a] text-[#1a1a1a] text-[10px] font-black px-3 py-1 rounded-full">
                    {incomingRequests.length}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {incomingRequests.map((req: any) => {
                    const days = calcDays(req.startDate, req.endDate);
                    const earnings = days * req.item.pricePerDay;
                    const left = daysRemaining(req.endDate);

                    return (
                      <div
                        key={req.id}
                        className="glass-panel rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-[#d4f07a]/50 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {req.item.imageUrl ? (
                            <img
                              src={req.item.imageUrl}
                              alt={req.item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#1a1a1a] text-base leading-tight line-clamp-1">
                            {req.item.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm text-gray-500 font-medium">
                              {req.renter.name || 'Renter'}
                            </span>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#d4f07a]" />
                            <span className="text-[11px] font-bold text-amber-600">
                              Trust {req.renter.trustScore}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-gray-400 font-medium">
                              {new Date(req.startDate).toLocaleDateString()} →{' '}
                              {new Date(req.endDate).toLocaleDateString()}
                            </span>
                            {req.status === 'active' && left >= 0 && (
                              <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                {left}d remaining
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Earnings */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-[#1a1a1a] text-lg">
                            ₹{earnings.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Est. Earnings
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0">
                          <RequestActionButtons
                            requestId={req.id}
                            status={req.status}
                            isOwner={true}
                            paymentStatus={req.paymentStatus}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* My Listings */}
            <section>
              <h2 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight mb-6">
                My Listings
              </h2>

              {items.length === 0 ? (
                <div className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#d4f07a]/20 flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-[#526600]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1a1a1a] mb-3 tracking-tight">
                    Start earning from your gear
                  </h3>
                  <p className="text-gray-500 max-w-sm mb-10 leading-relaxed font-medium">
                    Turn your idle equipment into professional earnings. List your first item to join the marketplace.
                  </p>
                  <Link href="/items/add">
                    <button className="bg-[#d4f07a] text-[#1a1a1a] px-10 py-4 rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-md">
                      List your first item
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {items.map((item) => (
                    <DashboardItemCard key={item.id} item={item} />
                  ))}

                  {/* Dashed Add New card */}
                  <Link href="/items/add">
                    <div className="rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#d4f07a] hover:bg-[#d4f07a]/5 transition-all aspect-[4/3] group">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#d4f07a] transition-colors">
                        <PlusCircle className="w-6 h-6 text-gray-400 group-hover:text-[#1a1a1a] transition-colors" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#1a1a1a] transition-colors text-center px-4">
                        Add New Listing
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </section>
          </>
        )}

        {/* ════════════════ RENTER VIEW ════════════════ */}
        {role === 'renter' && (
          <>
            <section>
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">My Requests</h2>
                {outgoingRequests.length > 0 && (
                  <span className="bg-[#1a1a1a] text-white text-[10px] font-black px-3 py-1 rounded-full">
                    {outgoingRequests.length}
                  </span>
                )}
              </div>

              {/* Status filter tabs */}
              {outgoingRequests.length > 0 && (
                <div className="flex gap-6 mb-8 border-b border-gray-200 overflow-x-auto">
                  {TABS.map(({ label, value }) => {
                    const isActive = tab === value;
                    return (
                      <Link
                        key={value}
                        href={`/dashboard?tab=${value}`}
                        className={`pb-3 px-1 text-sm font-bold whitespace-nowrap relative transition-colors ${
                          isActive ? 'text-[#1a1a1a]' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {label}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4f07a] rounded-full" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {outgoingRequests.length === 0 ? (
                <div className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1a1a1a] mb-3 tracking-tight">
                    Find gear for your next project
                  </h3>
                  <p className="text-gray-500 max-w-sm mb-10 leading-relaxed font-medium">
                    Explore items and make your first rental. Find exactly what you need for your next adventure.
                  </p>
                  <Link href="/explore">
                    <button className="bg-[#1a1a1a] text-white px-10 py-4 rounded-full font-bold text-base hover:bg-black active:scale-95 transition-all shadow-md">
                      Start Exploring Gear
                    </button>
                  </Link>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-400 font-bold text-base">No {tab} requests yet.</p>
                  <Link href={`/dashboard?tab=all`} className="mt-4 text-sm font-bold text-[#526600] hover:underline">
                    View all requests
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredRequests.map((req: any) => {
                    const days = calcDays(req.startDate, req.endDate);
                    const cost = days * req.item.pricePerDay;
                    const left = daysRemaining(req.endDate);
                    const badge = getStatusBadge(req.status, req.paymentStatus);

                    return (
                      <div
                        key={req.id}
                        className="glass-panel rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-[#d4f07a]/50 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {req.item.imageUrl ? (
                            <img
                              src={req.item.imageUrl}
                              alt={req.item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/items/${req.item.id}`}
                            className="font-bold text-[#1a1a1a] text-base hover:text-[#526600] transition-colors line-clamp-1 block"
                          >
                            {req.item.title}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm text-gray-500 font-medium">
                              from {req.item.owner?.name || 'Owner'}
                            </span>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#d4f07a]" />
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-gray-400 font-medium">
                              {new Date(req.startDate).toLocaleDateString()} →{' '}
                              {new Date(req.endDate).toLocaleDateString()}
                            </span>
                            {req.status === 'active' && left >= 0 && (
                              <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                {left}d remaining
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cost */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-[#1a1a1a] text-lg">₹{cost.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Total</p>
                        </div>

                        {/* Actions — status-specific, no duplicates */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          {req.status === 'pending' && (
                            <>
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${badge.cls}`}>
                                {badge.label}
                              </span>
                              <div className="flex items-center gap-2">
                                {req.item.id && req.startDate && req.endDate && req.item.title && (
                                  <EditRequestModal
                                    requestId={req.id}
                                    itemId={req.item.id}
                                    initialStartDate={new Date(req.startDate)}
                                    initialEndDate={new Date(req.endDate)}
                                    itemTitle={req.item.title}
                                  />
                                )}
                                <DeleteRequestButton requestId={req.id} />
                              </div>
                            </>
                          )}

                          {(req.status === 'accepted' || req.status === 'active') && (
                            <RequestActionButtons
                              requestId={req.id}
                              status={req.status}
                              isOwner={false}
                              paymentStatus={req.paymentStatus}
                              itemId={req.item.id}
                              startDate={new Date(req.startDate)}
                              endDate={new Date(req.endDate)}
                              itemTitle={req.item.title}
                            />
                          )}

                          {(req.status === 'completed' || req.status === 'rejected') && (
                            <>
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${badge.cls}`}>
                                {badge.label}
                              </span>
                              <Link href={`/items/${req.item.id}`}>
                                <button className="border border-[#d4f07a] text-[#526600] bg-transparent rounded-full h-9 px-4 font-bold text-sm hover:bg-[#d4f07a]/10 active:scale-95 transition-all flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5" />
                                  Rent Again
                                </button>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Recommended For You ────────────────────────── */}
            {recommended.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
                    Recommended For You
                  </h2>
                  <Link
                    href="/explore"
                    className="text-sm font-bold text-[#526600] hover:text-[#3d4d00] transition-colors flex items-center gap-1"
                  >
                    Browse all gear →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {recommended.map((item: any) => (
                    <Link key={item.id} href={`/items/${item.id}`}>
                      <div className="product-card-hover rounded-3xl overflow-hidden group cursor-pointer">
                        {/* Image */}
                        <div className="w-full aspect-video bg-gray-100 relative overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                          {item.category && (
                            <span className="absolute top-3 left-3 bg-[#1a1a1a]/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                              {item.category}
                            </span>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-5">
                          <h3 className="font-bold text-[#1a1a1a] text-base line-clamp-1 tracking-tight">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-gray-500 font-medium">
                              by {item.owner?.name || 'Owner'}
                            </span>
                            <ShieldCheck className="w-3 h-3 text-[#d4f07a]" />
                          </div>
                          <div className="flex items-baseline gap-1 mt-3">
                            <span className="font-black text-lg text-[#1a1a1a] tracking-tighter">
                              ₹{item.pricePerDay.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">/ day</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[#1a1a1a] mt-32 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-white/10 pb-12">
            <div className="max-w-xs">
              <div className="text-[#d4f07a] font-extrabold text-2xl tracking-tighter mb-4">RentO</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The premium peer-to-peer equipment rental marketplace.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { title: 'Platform', links: ['How it Works', 'Safety', 'RentO Plus'] },
                { title: 'Community', links: ['Reviews', 'Forum', 'Events'] },
                { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy'] },
              ].map((col) => (
                <div key={col.title} className="flex flex-col gap-3">
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#d4f07a]">
                    {col.title}
                  </h5>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© 2025 RentO Marketplace. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#d4f07a] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[#d4f07a] transition-colors">Instagram</a>
              <a href="#" className="hover:text-[#d4f07a] transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
