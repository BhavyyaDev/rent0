import { ItemCard, Item } from '@/components/item-card';
import { Camera, Speaker, Gamepad2, Sparkles, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SortControl } from '@/components/sort-control';

export const dynamic = 'force-dynamic';

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

  // Fetch items
  let rawItems: any[] = [];
  try {
    rawItems = await prisma.item.findMany({
      include: {
        owner: true,
        requests: {
          where: { status: 'accepted', endDate: { gte: new Date() } },
        },
      },
      orderBy,
    });
  } catch (error: any) {
    console.error('Database error:', error);
    rawItems = [];
  }

  const items = rawItems as unknown as Item[];

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-6xl md:text-7xl font-extrabold text-[#1a1a1a] mb-6 tracking-[-0.04em]">
          Explore Gear
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed font-medium">
          Browse our complete local equipment inventory and find everything you need to create.
        </p>
      </section>

      {/* ── Sort Controls ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <SortControl />
      </section>

      {/* ── Product Grid ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {items.length === 0 ? (
          <div className="flex flex-col gap-16 mt-8">
            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-32 bg-white/70 backdrop-blur-md rounded-3xl border border-white/30 shadow-sm relative overflow-hidden">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                <SearchIcon className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-[28px] font-black text-[#1a1a1a] mb-3 tracking-tight">
                No gear listed yet
              </h3>
              <p className="text-[17px] text-gray-500 max-w-sm mx-auto mb-12 font-medium leading-relaxed text-center">
                We're just getting started! Check back soon or jump start the marketplace by listing your own items.
              </p>
              <Link href="/items/add">
                <Button className="rounded-full h-14 px-10 text-base font-bold bg-[#1a1a1a] text-white hover:bg-black">
                  List your item
                </Button>
              </Link>
            </div>

            {/* Popular categories fallback */}
            <div className="flex flex-col gap-5">
              <h3 className="text-[22px] font-bold text-[#1a1a1a] px-2">Popular Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Cameras', sub: 'Lenses & rigs', icon: Camera, href: '/search?category=camera', bg: 'bg-[#d4f07a]/20 group-hover:bg-[#d4f07a]' },
                  { label: 'Audio', sub: 'Mics & speakers', icon: Speaker, href: '/search?category=audio', bg: 'bg-blue-100/50 group-hover:bg-blue-100' },
                  { label: 'Gaming', sub: 'Consoles & VR', icon: Gamepad2, href: '/search?category=gaming', bg: 'bg-purple-100/50 group-hover:bg-purple-100' },
                  { label: 'Tech', sub: 'Laptops & iPads', icon: Sparkles, href: '/search?category=tech', bg: 'bg-orange-100/50 group-hover:bg-orange-100' },
                ].map((cat) => (
                  <Link key={cat.label} href={cat.href}>
                    <div className="glass-card rounded-3xl p-8 flex flex-col items-start gap-4 group cursor-pointer">
                      <div className={`p-3 rounded-2xl ${cat.bg} transition-colors`}>
                        <cat.icon className="w-6 h-6 text-gray-800" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1a1a] text-lg">{cat.label}</h4>
                        <p className="text-gray-400 text-sm mt-0.5">{cat.sub}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-[#1a1a1a] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[#d4f07a] font-extrabold text-xl tracking-tighter">
            Rent<span className="text-white">O</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            © 2025 RentO Equipment Rentals. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-[#d4f07a] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#d4f07a] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
