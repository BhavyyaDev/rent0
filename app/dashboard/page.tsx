import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardItemCard } from '@/components/dashboard-item-card';
import { RequestActionButtons } from '@/components/request-action-buttons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShoppingBag, Package, Activity, Banknote, Search, XCircle } from 'lucide-react';
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

  // Get global user details and read Postgres role string
  const currentUser = await (prisma as any).user.findUnique({ where: { id: userId } });
  const role = currentUser?.role || 'renter';

  // Fetch items owned by the current user
  const rawItems = await prisma.item.findMany({
    where: { ownerId: userId },
    include: { owner: true },
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
      <div className="bg-white border-b border-slate-200/60 pt-10 pb-12">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-[32px] md:text-[40px] font-extrabold tracking-tight text-[#222222]">Dashboard Overview</h1>
              <p className="text-[17px] text-[#717171] mt-2 font-medium">Your complete marketplace summary.</p>
            </div>

            <div className="flex items-center gap-3">
              <RoleToggle currentRole={role} />

              {role === 'lender' && (
                <Link href="/items/add">
                  <Button className="rounded-full h-12 px-7 text-base font-bold shadow-md hover:shadow-lg transition-all gap-2 bg-slate-900 hover:bg-slate-800 text-white active:scale-95">
                    <PlusCircle className="w-5 h-5" /> Add New Item
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
                <p className="text-[#717171] font-semibold text-sm uppercase tracking-wider mb-1">Total Listings</p>
                <p className="text-3xl font-extrabold text-[#222222]">{totalListings}</p>
              </div>
            </div>

            {/* Active Listings Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[#717171] font-semibold text-sm uppercase tracking-wider mb-1">Active Listings</p>
                <p className="text-3xl font-extrabold text-[#222222]">{activeListings}</p>
              </div>
            </div>

            {/* Estimated Value Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[#717171] font-semibold text-sm uppercase tracking-wider mb-1">Estimated Value</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-extrabold text-[#222222]">₹{estimatedValue.toLocaleString()}</p>
                  <span className="text-[#717171] font-medium text-sm">/mo</span>
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
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-[28px] font-extrabold text-[#222222]">Lender Dashboard</h2>
              <p className="text-[#717171] font-medium mt-1">Manage your inventory and fulfill incoming rental requests.</p>
            </div>

            {/* Incoming Requests Section */}
            {incomingRequests && incomingRequests.length > 0 && (
              <div>
                <h3 className="text-[20px] font-extrabold text-[#222222] mb-5">Incoming Bookings</h3>
                <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[13px] tracking-widest text-slate-500 uppercase font-bold">
                        <th className="p-5 font-bold">Item</th>
                        <th className="p-5 font-bold">Renter</th>
                        <th className="p-5 font-bold">Dates</th>
                        <th className="p-5 font-bold">Status</th>
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
                            <div className="font-bold text-slate-900">{req.renter.name || 'Verified Renter'}</div>
                            <div className="text-sm font-medium text-slate-500">{req.renter.email}</div>
                          </td>
                          <td className="p-5 text-slate-600 font-bold whitespace-nowrap text-sm">
                            {new Date(req.startDate).toLocaleDateString()} <span className="text-slate-400 mx-1">→</span> {new Date(req.endDate).toLocaleDateString()}
                          </td>
                          <td className="p-5 w-40">
                            <RequestActionButtons requestId={req.id} status={req.status} />
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
              <div className="flex flex-col items-center justify-center p-12 py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm mt-2">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-[26px] font-extrabold text-[#222222] mb-3">
                  You haven't listed anything yet
                </h3>
                <p className="text-[17px] text-[#717171] max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                  Start earning by listing items you don't use every day. Your gear could be making someone else's project possible.
                </p>
                <Link href="/items/add">
                  <Button className="rounded-full h-14 px-10 text-lg font-bold shadow-xl shadow-slate-200 transition-all active:scale-95 bg-slate-900 text-white hover:bg-slate-800">
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
                <h3 className="text-[20px] font-extrabold text-[#222222] mb-5">My Requests</h3>
                <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[13px] tracking-widest text-slate-500 uppercase font-bold">
                        <th className="p-5 font-bold">Item</th>
                        <th className="p-5 font-bold">Owner</th>
                        <th className="p-5 font-bold">Dates</th>
                        <th className="p-5 font-bold">Status</th>
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
                            <div className="font-bold text-slate-900 text-[14px]">{req.item.owner?.name || 'Verified Owner'}</div>
                          </td>
                          <td className="p-5 text-slate-600 font-bold whitespace-nowrap text-[14px]">
                            {new Date(req.startDate).toLocaleDateString()} <span className="text-slate-400 mx-1">→</span> {new Date(req.endDate).toLocaleDateString()}
                          </td>
                          <td className="p-5 w-60">
                            <div className="flex items-center gap-3">
                              {req.status === 'completed' && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm whitespace-nowrap">
                                  Completed! Welcome back ✨
                                </span>
                              )}
                              {req.status === 'pending' && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm whitespace-nowrap">
                                  Waiting for owner
                                </span>
                              )}
                              {req.status === 'accepted' && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm whitespace-nowrap">
                                  Accepted - proceed to pickup
                                </span>
                              )}
                              {req.status === 'rejected' && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm whitespace-nowrap">
                                  Rejected
                                </span>
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
              <div className="flex flex-col items-center justify-center p-12 py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm mt-2">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-blue-300" />
                </div>
                <h3 className="text-[26px] font-extrabold text-[#222222] mb-3">
                  No rental requests yet
                </h3>
                <p className="text-[17px] text-[#717171] max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                  Explore items and make your first rental.
                </p>
                <Link href="/search">
                  <Button className="rounded-full h-14 px-10 text-lg font-bold shadow-xl shadow-blue-200 transition-all active:scale-95 bg-blue-600 text-white hover:bg-blue-700">
                    Go to Explore
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
