import { prisma } from '@/lib/prisma';
import { ItemCard } from '@/components/item-card';

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Featured Items</h1>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground border rounded-2xl border-dashed">
          <p className="text-lg mb-2">No items available to rent.</p>
          <p className="text-sm">Be the first to list an item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id}>
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
