import { ItemCard } from '@/components/item-card';
import { ShieldCheck } from 'lucide-react';
import { CategoryBar } from '@/components/category-bar';
import { syncUser } from '@/lib/syncUser';
import { prisma } from '@/lib/db';

// force dynamic page
export const dynamic = "force-dynamic";

export default async function ExplorePage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // Synchronize authenticated user
  const user = await syncUser();
  const searchParams = await props.searchParams;
  const categoryFilter = searchParams.category;

  // Fetch real items from the database
  const items = await prisma.item.findMany({
    where: (categoryFilter
      ? { category: categoryFilter }
      : {}) as any,
    include: { owner: true } as any,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Category Header */}
      <div className="w-full bg-white border-b border-slate-200/60 sticky top-16 z-40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-4">
          <CategoryBar />
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-10">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 py-32 text-center mt-6 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#222222] mb-3">
              No results found
            </h3>
            <p className="text-[17px] text-[#717171] max-w-sm mx-auto mb-10 font-medium leading-relaxed">
              Try adjusting your filters or search criteria to find what you're looking for.
            </p>
            <button
              onClick={() => window.location.href = '/explore'}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-[28px] font-extrabold tracking-tight text-[#222222]">
                  {categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Listings` : 'Explore all gear'}
                </h2>
                <p className="text-[#717171] font-medium mt-1">
                  Showing {items.length} unique items available for rent.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-14 mb-20">
              {items.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
