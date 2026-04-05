import { ItemCard } from '@/components/item-card';
import { ShieldCheck, Camera, Speaker, Gamepad2, Laptop } from 'lucide-react';
import { CategoryBar } from '@/components/category-bar';
import { syncUser } from '@/lib/syncUser';
import { prisma } from '@/lib/db';

// force dynamic page
export const dynamic = "force-dynamic";

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // Synchronize authenticated user
  const user = await syncUser();
  const searchParams = await props.searchParams;
  const categoryFilter = searchParams.category;


  // Fetch real items from the database
  const items = await prisma.item.findMany({
    where: categoryFilter
      ? {
        description: {
          contains: categoryFilter.toLowerCase(),
        },
      }
      : {},

    include: { owner: true },
    orderBy: { createdAt: 'desc' },
  });

  const popularItems = [...items].slice(0, 4);
  const recentItems = items.slice(0, 8);


  return (
    <>
      <div className="w-full bg-white border-b border-[#EBEBEB] py-5 px-6 md:px-10 lg:px-20">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-[18px] font-[600] tracking-tight text-[#222222]">
            Rent anything, anytime
          </h2>
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 pt-8 pb-16">
        <CategoryBar />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 py-24 text-center mt-12 bg-[#F7F7F7] rounded-[16px]">
            <h3 className="text-2xl font-[600] text-[#222222] mb-3">
              No items yet. Be the first to add one.
            </h3>
            <p className="text-[16px] text-[#6A6A6A]">
              Your items will appear here once you list them.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 mt-10">
              <h2 className="text-[22px] font-[600] tracking-tight text-[#222222]">
                Browse Items
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 mb-16">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
