import { ItemCard, Item } from '@/components/item-card';
import { Package, Camera, Speaker, Gamepad2, Sparkles, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SortControl } from '@/components/sort-control';

export const dynamic = "force-dynamic";

export default async function ExplorePage(props: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'newest';

  // Determine sort order
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-low') {
    orderBy = { pricePerDay: 'asc' };
  }

  // Fetch items from the database with filtered order
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
    orderBy,
  });

  const items = rawItems as unknown as Item[];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Header wrapper for background fill */}
      <div className="bg-white border-b border-slate-200/60 pt-16 pb-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="flex flex-col gap-4 text-left">
            <h1 className="text-[40px] md:text-[56px] font-black text-slate-950 tracking-tighter leading-none">
              Explore Gear
            </h1>
            <p className="text-xl text-slate-500 font-bold max-w-2xl leading-relaxed">
              Browse our complete local equipment inventory and find everything you need to create.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-12">
        {/* Sorting Controls */}
        <div className="mb-12">
          <SortControl />
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col gap-16 mt-8">
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-950/10" />
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                <SearchIcon className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-[28px] font-black text-slate-950 mb-3 tracking-tight">No gear listed yet</h3>
              <p className="text-[17px] text-slate-500 max-w-sm mx-auto mb-12 font-bold leading-relaxed text-center">
                We're just getting started! Check back soon for new gear additions or jump start the marketplace by listing your own items.
              </p>
              <Link href="/items/add">
                <Button className="rounded-full h-15 px-10 text-lg font-black shadow-md transition-all active:scale-[0.97] bg-slate-950 text-white hover:bg-black">
                  List your item
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col gap-5">
              <h3 className="text-[22px] font-bold text-slate-900 px-2">Popular Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  <Link href="/search?category=camera" className="group rounded-[24px] bg-white border border-slate-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
                       <Camera className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="font-bold text-[#222222] text-lg">Cameras</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Lenses & rigs</p>
                    </div>
                  </Link>
                  <Link href="/search?category=audio" className="group rounded-[24px] bg-white border border-slate-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
                       <Speaker className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="font-bold text-[#222222] text-lg">Audio</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Mics & speakers</p>
                    </div>
                  </Link>
                  <Link href="/search?category=gaming" className="group rounded-[24px] bg-white border border-slate-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
                       <Gamepad2 className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="font-bold text-[#222222] text-lg">Gaming</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Consoles & VR</p>
                    </div>
                  </Link>
                  <Link href="/search?category=tech" className="group rounded-[24px] bg-white border border-slate-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all active:scale-95">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
                       <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="font-bold text-[#222222] text-lg">Tech</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Laptops & iPads</p>
                    </div>
                  </Link>
              </div>
            </div>
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
