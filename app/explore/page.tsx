import { prisma } from '@/lib/db';
import { ItemCard, Item } from '@/components/item-card';
import { Package } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  // Fetch all items from the database with owner relation
  const rawItems = await prisma.item.findMany({
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

  const items = rawItems as unknown as Item[];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-16">
        <div className="flex flex-col gap-2 mb-12">
          <h1 className="text-[32px] md:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Explore Gear
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Browse the entire RentO inventory and find exactly what you need.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No items listed yet</h3>
            <p className="text-slate-500 font-medium tracking-tight">Check back soon for new gear additions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12 animate-in fade-in slide-in-from-bottom-3 duration-700">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
