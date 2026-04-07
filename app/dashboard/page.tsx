import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardItemCard } from '@/components/dashboard-item-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShoppingBag } from 'lucide-react';
import { Item } from '@/components/item-card';

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch items owned by the current user
  const rawItems = await prisma.item.findMany({
    where: { ownerId: userId },
    include: { owner: true },
    orderBy: { createdAt: 'desc' },
  });

  // Type cast to match the Item interface
  const items = rawItems as unknown as Item[];

  return (
    <div className="min-h-screen bg-[#F7F7F7] pt-8 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#222222]">My Listings</h1>
            <p className="text-[#6A6A6A] mt-2 font-medium">Manage and monitor your rental items in one place.</p>
          </div>
          
          <Link href="/items/add">
            <Button className="rounded-full h-12 px-6 text-base font-semibold shadow-sm hover:shadow-md transition-all gap-2 bg-[#10b981] hover:bg-[#059669]">
              <PlusCircle className="w-5 h-5" /> Add New Item
            </Button>
          </Link>
        </div>

        {/* Listings Grid */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 py-24 text-center bg-white rounded-[32px] border border-[#EBEBEB] shadow-sm">
            <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-[#6A6A6A]" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#222222] mb-3">
              No listings yet
            </h3>
            <p className="text-[#6A6A6A] max-w-sm mx-auto mb-8 text-lg font-medium">
              Start earning by listing items you don't use every day.
            </p>
            <Link href="/items/add">
              <Button variant="outline" className="rounded-full h-12 px-8 text-base font-semibold border-2 hover:bg-slate-50">
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {items.map((item) => (
              <DashboardItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
