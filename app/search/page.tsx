import { ItemCard } from '@/components/item-card';
import { ShieldCheck, Search as SearchIcon } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { syncUser } from '@/lib/syncUser';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = "force-dynamic";

export default async function SearchPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // Synchronize authenticated user
  await syncUser();
  const searchParams = await props.searchParams;

  const rawSearch = searchParams.search;
  const searchFilter = typeof rawSearch === 'string' ? rawSearch.trim() : "";
  
  const rawStart = searchParams.start;
  const rawEnd = searchParams.end;
  const startDate = typeof rawStart === 'string' ? rawStart.trim() : undefined;
  const endDate = typeof rawEnd === 'string' ? rawEnd.trim() : undefined;
  const dateFilterActive = !!(startDate && endDate);

  // Build the explicit search where filter
  const whereClause: any = {};
  if (searchFilter) {
    whereClause.OR = [
      { title: { contains: searchFilter, mode: 'insensitive' } },
      { description: { contains: searchFilter, mode: 'insensitive' } }
    ];
  }

  // Fetch real items from the database
  const items = await (prisma as any).item.findMany({
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
    orderBy: { createdAt: 'desc' },
  });

  const parsedStart = startDate ? new Date(startDate) : undefined;
  const parsedEnd = endDate ? new Date(endDate) : undefined;

  const processedItems = items.map((item: any) => {
    let conflict = false;
    if (dateFilterActive && parsedStart && parsedEnd) {
      conflict = item.requests?.some((req: any) => {
        return new Date(req.startDate) <= parsedEnd && new Date(req.endDate) >= parsedStart;
      });
    }
    return { ...item, hasBookingConflict: conflict };
  });

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-10 pt-16">
        <SearchBar />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 py-32 text-center mt-6 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#222222] mb-3">
              {searchFilter ? `No items found for '${searchFilter}'` : "No items found"}
            </h3>
            <p className="text-[17px] text-[#717171] max-w-sm mx-auto mb-10 font-medium leading-relaxed">
              We couldn't find a match. Try searching for Camera, Gaming, or Audio instead.
            </p>
            <div className="flex gap-4 items-center justify-center flex-wrap">
              <Link href="/search?search=Camera">
                <Button variant="outline" className="rounded-full shadow-sm font-semibold h-12 px-6">Camera</Button>
              </Link>
              <Link href="/search?search=Gaming">
                <Button variant="outline" className="rounded-full shadow-sm font-semibold h-12 px-6">Gaming</Button>
              </Link>
              <Link href="/search?search=Audio">
                <Button variant="outline" className="rounded-full shadow-sm font-semibold h-12 px-6">Audio</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-[28px] font-extrabold tracking-tight text-[#222222]">
                  {searchFilter ? `Search results for '${searchFilter}'` : "Search all items"}
                </h2>
                <p className="text-[#717171] font-medium mt-1">
                  Showing {items.length} unique items matching your search.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-14 mb-20">
              {processedItems.map((item: any) => (
                <ItemCard key={item.id} item={item} dateFilterActive={dateFilterActive} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
