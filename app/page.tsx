import { prisma } from '@/lib/prisma';
import { ItemCard } from '@/components/item-card';
import { ShieldCheck, Camera, Speaker, Gamepad2, Laptop } from 'lucide-react';

const CATEGORIES = [
  { name: 'Cameras', icon: Camera },
  { name: 'Speakers', icon: Speaker },
  { name: 'Gaming', icon: Gamepad2 },
  { name: 'Laptops', icon: Laptop },
];

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Mocking popular items by reversing the list for display purposes
  const popularItems = [...items].reverse().slice(0, 4);
  const recentItems = items.slice(0, 8);

  return (
    <>
      <div className="w-full bg-emerald-50/50 border-b border-emerald-100/50 py-3 px-4">
        <p className="text-sm font-medium text-emerald-800 flex items-center justify-center gap-2 tracking-tight">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Safe, trusted rentals — built for students
        </p>
      </div>

      <div className="bg-[#0F172A] w-full py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
          Rent anything, anytime
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-medium">
          A safe and trusted rental marketplace
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10 max-w-7xl">
        {/* Categories Section */}
        <div className="mb-14">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-5">Browse by Category</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.name} 
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200/80 bg-white font-semibold text-slate-700 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <cat.icon className="w-5 h-5 text-emerald-600" />
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 py-24 bg-[#F8FAFC] border border-slate-200/60 rounded-[24px] shadow-sm text-center mt-8">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No items listed yet.</h3>
            <p className="text-slate-500 max-w-md">Be the first to add one.</p>
          </div>
        ) : (
          <>
            {/* Popular Items Section */}
            <div className="mb-8 mt-12 flex justify-between items-end">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Popular Items</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-16">
              {popularItems.map((item) => (
                <ItemCard key={`popular-${item.id}`} item={item} />
              ))}
            </div>

            {/* Recently Added Section */}
            <div className="mb-8 mt-12 flex justify-between items-end border-t border-slate-100 pt-16">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Recently Added</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pb-16">
              {recentItems.map((item) => (
                <ItemCard key={`recent-${item.id}`} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
