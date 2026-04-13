import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardItemCard } from '@/components/dashboard-item-card';
import { RequestActionButtons } from '@/components/request-action-buttons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShoppingBag, Package, Activity, Banknote, Search, XCircle, ShieldCheck, Tag, Calendar } from 'lucide-react';
import { Item } from '@/components/item-card';
import { RoleToggle } from '@/components/role-toggle';
import { deleteRequest, syncRequestStatuses } from '@/app/actions/request';
import { EditRequestModal } from '@/components/edit-request-modal';
import { DeleteRequestButton } from '@/components/delete-request-button';

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Ensure all request statuses are current based on the clock
  await syncRequestStatuses();

  // Get global user details and read Postgres role string
  const currentUser = await (prisma as any).user.findUnique({ where: { id: userId } });
  const role = currentUser?.role || 'renter';

  // Fetch items owned by the current user
  const rawItems = await prisma.item.findMany({
    where: { ownerId: userId },
    include: { 
      owner: true,
      requests: {
        where: {
          status: 'accepted',
          endDate: { gte: new Date() }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Type cast to match the Item interface
  const items = rawItems as unknown as Item[];

  // Fetch incoming rental requests for items owned by this user
  const incomingRequests = await (prisma as any).request.findMany({
    where: {
      item: {
        ownerId: userId,
      },
    },
    include: {
      item: true,
      renter: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch outgoing rental requests made by this user (Renter View)
  const outgoingRequests = await (prisma as any).request.findMany({
    where: { renterId: userId },
    include: {
      item: { include: { owner: true } }
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalListings = items.length;
  const activeListings = items.length;
  // Estimated mock value calculation
  const estimatedValue = items.reduce((acc, item) => acc + (item.pricePerDay * 10), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header wrapper for background fill */}
      <div className="bg-white border-b border-slate-200/60 pt-16 pb-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-[36px] md:text-[52px] font-black tracking-tighter text-slate-950 leading-none">Dashboard</h1>
              <p className="text-xl text-slate-500 font-bold max-w-2xl leading-relaxed">Your complete marketplace summary and inventory management.</p>
            </div>

            <div className="flex items-center gap-4">
              <RoleToggle currentRole={role} />

              {role === 'lender' && (
                <Link href="/items/add">
                  <Button className="rounded-full h-15 px-8 text-base font-black shadow-md transition-all duration-200 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95">
                    <PlusCircle className="w-5 h-5" /> List New Gear
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Total Listings Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1">Total Listings</p>
                <p className="text-4xl font-black text-slate-950">{totalListings}</p>
              </div>
            </div>

            {/* Active Listings Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1">Active Listings</p>
                <p className="text-4xl font-black text-slate-950">{activeListings}</p>
              </div>
            </div>

            {/* Estimated Value Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1">Estimated Value</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black text-slate-950">₹{estimatedValue.toLocaleString()}</p>
                  <span className="text-slate-500 font-bold text-sm">/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 mt-16 flex flex-col gap-24">

        {/* --- LENDER VIEW (OWNER ROLE) --- */}
        {role === 'lender' && (
          <section className="flex flex-col gap-10">
            <div className="border-b-2 border-slate-200 pb-6 text-left">
              <h2 className="text-[32px] font-black text-slate-950 tracking-tighter">Lender Dashboard</h2>
              <p className="text-slate-500 font-bold mt-2">Manage your inventory and fulfill incoming rental requests.</p>
            </div>

            {/* Incoming Requests Section */}
            {incomingRequests && incomingRequests.length > 0 && (
              <div>
                <h3 className="text-[20px] font-extrabold text-[#222222] mb-5">Incoming Bookings</h3>
                <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b-2 border-slate-200 text-[11px] tracking-[0.2em] text-slate-400 uppercase font-black">
                        <th className="p-6">ITEM</th>
                        <th className="p-6">RENTER</th>
                        <th className="p-6">DATES</th>
                        <th className="p-6 text-right">EARNINGS</th>
                        <th className="p-6">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {incomingRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-5">
                            <div className="font-bold text-slate-900 line-clamp-1">{req.item.title}</div>
                            <div className="text-sm font-medium text-emerald-600">₹{req.item.pricePerDay}/day</div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-slate-900">{req.renter.name || 'Verified Renter'}</div>
                              <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="text-[12px] font-bold text-slate-500">{req.renter.email}</div>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span className="text-[11px] font-bold text-amber-600">Trust {req.renter.trustScore}%</span>
                            </div>
                          </td>
                          <td className="p-5 text-slate-600 font-bold whitespace-nowrap text-sm">
                            {new Date(req.startDate).toLocaleDateString()} <span className="text-slate-400 mx-1">→</span> {new Date(req.endDate).toLocaleDateString()}
                          </td>
                          <td className="p-5 text-right">
                            <div className="font-extrabold text-[#222222]">₹{(req.totalPrice || 0).toLocaleString()}</div>
                            {req.paymentStatus === 'held' ? (
                              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Pending Release</div>
                            ) : req.paymentStatus === 'released' ? (
                              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Received</div>
                            ) : null}
                          </td>
                          <td className="p-5 w-40">
                            <RequestActionButtons requestId={req.id} status={req.status} isOwner={true} />
                            {req.paymentStatus === 'released' && (
                              <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 text-center">
                                Payment released to owner
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* User Inventory Grid */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 py-32 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20" />
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
                  <ShoppingBag className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-950 mb-3 tracking-tighter">
                  Start earning from your gear
                </h3>
                <p className="text-[17px] text-slate-500 max-w-sm mx-auto mb-10 font-bold leading-relaxed">
                  Turn your idle equipment into professional earnings. List your first item to join the marketplace.
                </p>
                <Link href="/items/add">
                  <Button className="rounded-full h-15 px-10 text-lg font-black shadow-md bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 duration-200">
                    List your first item
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <h3 className="text-[20px] font-extrabold text-[#222222] mb-6">Your Inventory</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
                  {items.map((item) => (
                    <DashboardItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}


        {/* --- RENTER VIEW (CUSTOMER ROLE) --- */}
        {role === 'renter' && (
          <section className="flex flex-col gap-10">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-[28px] font-extrabold text-[#222222]">Renter Dashboard</h2>
              <p className="text-[#717171] font-medium mt-1">Track the status of gear you want to rent from others.</p>
            </div>

            {outgoingRequests && outgoingRequests.length > 0 ? (
              <div>
                <h3 className="text-[20px] font-black text-slate-950 mb-6">My Requests</h3>
                <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-200 text-[11px] tracking-[0.2em] text-slate-400 uppercase font-black">
                        <th className="p-6">ITEM</th>
                        <th className="p-6">OWNER</th>
                        <th className="p-6">DATES</th>
                        <th className="p-6">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {outgoingRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-5">
                            <Link href={`/items/${req.item.id}`} className="font-bold text-slate-900 line-clamp-1 hover:underline text-[15px]">{req.item.title}</Link>
                            <div className="text-[13px] font-bold text-emerald-600 mt-0.5">₹{req.item.pricePerDay}/day</div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-slate-900 text-[14px]">{req.item.owner?.name || 'Verified Owner'}</div>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
                            </div>
                            <div className="text-[11px] font-bold text-amber-600 mt-0.5">Trust {req.item.owner?.trustScore}%</div>
                          </td>
                          <td className="p-5 text-slate-600 font-bold whitespace-nowrap text-[14px]">
                            {new Date(req.startDate).toLocaleDateString()} <span className="text-slate-400 mx-1">→</span> {new Date(req.endDate).toLocaleDateString()}
                          </td>
                          <td className="p-5">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-900 text-[15px]">₹{(req.totalPrice || 0).toLocaleString()}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Deposit</span>
                                <span className="text-[11px] font-bold text-amber-600">₹{(req.deposit || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 w-60">
                            <div className="flex items-center gap-3">
                              <RequestActionButtons requestId={req.id} status={req.status} isOwner={false} />
                              
                              {req.paymentStatus === 'held' && req.status === 'accepted' && (
                                <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  Deposit secured
                                </div>
                              )}

                              {/* Edit/Cancellation Button Logic */}
                              {req.status === 'pending' && (
                                <div className="flex items-center gap-2 ml-4">
                                  <EditRequestModal
                                    requestId={req.id}
                                    itemId={req.item.id}
                                    initialStartDate={new Date(req.startDate)}
                                    initialEndDate={new Date(req.endDate)}
                                    itemTitle={req.item.title}
                                  />
                                  <DeleteRequestButton requestId={req.id} />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
            <div className="flex flex-col items-center justify-center p-12 py-32 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-950/10" />
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                  <Search className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-slate-950 mb-3 tracking-tighter">
                  Find gear for your next project
                </h3>
                <p className="text-[17px] text-slate-500 max-w-sm mx-auto mb-10 font-bold leading-relaxed">
                  Explore items and make your first rental. Find exactly what you need for your next adventure.
                </p>
                <Link href="/explore">
                  <Button className="rounded-full h-15 px-10 text-lg font-black shadow-md bg-slate-950 text-white hover:bg-black transition-all active:scale-95 duration-200">
                    Start Exploring Gear
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
