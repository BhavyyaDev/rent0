import { prisma } from '@/lib/prisma';
import { ItemCard } from '@/components/item-card';

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 max-w-[1400px]">
      <div className="flex justify-between items-end mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Featured items</h1>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-32 bg-white border border-slate-200/60 rounded-[32px] shadow-sm">
          <p className="text-xl font-medium text-slate-900 mb-2">No items available to rent</p>
          <p className="text-slate-500">Be the first to list an item and start earning today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
          {items.map((item) => (
             <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
