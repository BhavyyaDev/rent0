import { ItemCard, Item } from '@/components/item-card';
import { Camera, Speaker, Gamepad2, Sparkles, Search as SearchIcon } from 'lucide-react';
import { CategoryBar } from '@/components/category-bar';
import { SearchFilters } from '@/components/search-filters';
import { syncUser } from '@/lib/syncUser';
import { prisma } from '@/lib/db';
import Link from 'next/link';

// force dynamic page
export const dynamic = "force-dynamic";

export default async function SearchPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  // Synchronize authenticated user
  const user = await syncUser();
  
  // Initialize variables outside try block for scoping
  let items: Item[] = [];
  let categoryFilter = '';
  let q = '';
  let isDateFiltering = false;
  let parsedStartDate: Date | undefined;
  let parsedEndDate: Date | undefined;

  try {
    // Safely await robust searchParams intercepting undefined completely
    const searchParams = (await props.searchParams) || {};
    const categoryParamArray = searchParams.category;
    // Handle potential arrays from query params safely
    const categoryParam = Array.isArray(categoryParamArray) ? categoryParamArray[0] : categoryParamArray;
    categoryFilter = categoryParam || '';
    q = String(searchParams.q || '').trim();
    const sort = searchParams.sort || 'newest';
    const startDateParam = searchParams.startDate;
    const endDateParam = searchParams.endDate;

    if (startDateParam && endDateParam) {
      const s = new Date(startDateParam);
      const e = new Date(endDateParam);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        parsedStartDate = s;
        parsedEndDate = e;
        isDateFiltering = true;
      }
    }

    // Use safe parsing for numeric filters
    const minPriceStr = searchParams.minPrice;
    const maxPriceStr = searchParams.maxPrice;
    const minPrice = minPriceStr ? parseInt(minPriceStr) : undefined;
    const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : undefined;

    // Build a robust whereClause following strict category requirements
    const whereClause: any = {
      category: categoryParam || undefined,
    };
    const conditions: any[] = [];
    
    if (q) {
      conditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      });
    }
    


    // NEW: Date-based availability filtering (Overlap exclusion)
    if (isDateFiltering && parsedStartDate && parsedEndDate) {
      conditions.push({
        requests: {
          none: {
            status: 'accepted',
            startDate: { lte: parsedEndDate },
            endDate: { gte: parsedStartDate }
          }
        }
      });
    }

    if (typeof minPrice === 'number' && !isNaN(minPrice)) {
      whereClause.pricePerDay = { ...whereClause.pricePerDay, gte: minPrice };
    }
    if (typeof maxPrice === 'number' && !isNaN(maxPrice)) {
      whereClause.pricePerDay = { ...whereClause.pricePerDay, lte: maxPrice };
    }

    if (conditions.length > 0) {
      whereClause.AND = conditions;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { pricePerDay: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { pricePerDay: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // Fetch real items strictly through verified clauses
    const rawItems = await (prisma as any).item.findMany({
      where: whereClause,
      include: { 
        owner: true,
        requests: {
          where: {
            status: 'accepted',
            endDate: { gte: new Date() }
          }
        }
      },
      orderBy,
    });

    items = rawItems as unknown as Item[];
  } catch (error) {
    console.error(`[Search Page] Critical Error:`, error);
    // On error, fallback to empty array to prevent 500 crash
    items = [];
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Category Header */}
      <div className="w-full bg-white border-b border-slate-200/60 sticky top-16 z-40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-4">
          <CategoryBar />
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-10">
        <SearchFilters />
        
        {items.length === 0 ? (
          <div className="flex flex-col mt-6 gap-12">
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <SearchIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-[26px] font-extrabold text-[#222222] mb-3">
                {isDateFiltering 
                  ? "No gear available for those dates" 
                  : "No items found"}
              </h3>
              <p className="text-[17px] text-[#717171] max-w-md mx-auto mb-10 font-medium leading-relaxed">
                We couldn't find exactly what you were looking for. Explore some of our popular categories below or clear your filters to see our full inventory.
              </p>
              {categoryFilter ? (
                <Link
                  href="/search"
                  className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200/50 inline-block"
                >
                  Explore all gear
                </Link>
              ) : null}
            </div>

            {/* Smart Category Fallback block */}
            <div className="flex flex-col gap-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <h3 className="text-[20px] font-extrabold text-[#222222] px-2">Popular Categories</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  <Link href="/search?category=camera" className="group rounded-[24px] bg-white border border-slate-100 p-6 flex flex-col gap-4 text-left shadow-sm hover:shadow-xl hover:border-slate-200 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Camera className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#222222] text-lg">Cameras</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Lenses & rigs</p>
                    </div>
                  </Link>

                  <Link href="/search?category=audio" className="group rounded-[24px] bg-white border border-slate-100 p-6 flex flex-col gap-4 text-left shadow-sm hover:shadow-xl hover:border-slate-200 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Speaker className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#222222] text-lg">Audio</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Mics & speakers</p>
                    </div>
                  </Link>

                  <Link href="/search?category=gaming" className="group rounded-[24px] bg-white border border-slate-100 p-6 flex flex-col gap-4 text-left shadow-sm hover:shadow-xl hover:border-slate-200 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Gamepad2 className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#222222] text-lg">Gaming</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Consoles & VR</p>
                    </div>
                  </Link>

                  <Link href="/search?category=tech" className="group rounded-[24px] bg-white border border-slate-100 p-6 flex flex-col gap-4 text-left shadow-sm hover:shadow-xl hover:border-slate-200 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#222222] text-lg">Tech</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Laptops & iPads</p>
                    </div>
                  </Link>
                  
                  <Link href="/search" className="group rounded-[24px] bg-slate-900 border border-slate-900 p-6 flex flex-col gap-4 text-left shadow-xl hover:shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Explore All</h4>
                      <p className="text-slate-300 text-sm font-medium mt-1">Entire inventory</p>
                    </div>
                  </Link>
               </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-[28px] font-extrabold tracking-tight text-[#222222]">
                  {q 
                    ? `Results for "${q}"`
                    : categoryFilter 
                      ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Gear` 
                      : 'Explore all gear'}
                </h2>
                <p className="text-[#717171] font-medium mt-1">
                  Showing {items.length} incredibly unique {items.length === 1 ? 'item' : 'items'} available for rent.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-14 mb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
