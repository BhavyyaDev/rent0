import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Camera } from 'lucide-react';
import { prisma } from '@/lib/db';
import { BookingWidget } from '@/components/booking-widget';
import { syncRequestStatuses } from '@/app/actions/request';

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Sync statuses to ensure availability is accurate (lazy sync)
  await syncRequestStatuses();

  // Fetch the item from the database
  const item = await prisma.item.findUnique({
    where: { id },
    include: { owner: true }
  });

  // Fetch all accepted requests for this item to show unavailable dates
  const acceptedRequests = await (prisma as any).request.findMany({
    where: {
      itemId: id,
      status: 'accepted'
    },
    select: {
      startDate: true,
      endDate: true
    }
  });

  // Safely map dates for the frontend
  const bookedRanges = acceptedRequests.map((req: any) => ({
    from: req.startDate.toISOString(),
    to: req.endDate.toISOString()
  }));

  if (!item) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-7xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Items
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* LEFT COLUMN: Image, Title, Description */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="rounded-[32px] overflow-hidden bg-slate-50 relative border border-slate-200/60 shadow-sm flex items-center justify-center mb-10 w-full aspect-video md:aspect-[4/3] lg:aspect-[16/10]">
            {item?.imageUrl ? (
              <img src={item.imageUrl} alt={item?.title || 'Item'} className="object-cover w-full h-full" />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-slate-300" />
                </div>
                <span className="font-semibold text-lg text-slate-500">Image unavailable</span>
                <span className="text-sm">This owner hasn't uploaded a photo yet.</span>
              </div>
            )}
          </div>

          <div className="flex flex-col px-1">
            <Badge variant="outline" className="w-fit mb-5 rounded-full border-slate-200 text-emerald-600 px-4 py-1.5 shadow-sm font-semibold bg-emerald-50 text-sm">Available Now</Badge>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">{item?.title || 'Untitled Item'}</h1>

            <div className="prose prose-sm max-w-none pt-4 border-t border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[17px]">{item?.description || 'No description provided by the owner.'}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Booking Widget */}
        <div className="flex flex-col relative relative z-10">
          <div className="sticky top-28 bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[32px] p-6 sm:p-8 flex flex-col">
            <div className="flex flex-col mb-6">
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                ${(item?.pricePerDay || 0).toFixed(2)} <span className="text-xl font-medium text-slate-500 tracking-normal">/ day</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
              <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">{item?.owner?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-lg leading-tight">{item?.owner?.name || 'Unknown User'}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Verified Owner
                  </span>
                  {(item?.owner?.trustScore ?? 0) > 0 && (
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded shadow-sm">
                      Trust {item.owner!.trustScore}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <BookingWidget 
              itemId={item?.id || ''} 
              pricePerDay={item?.pricePerDay || 0} 
              bookedRanges={bookedRanges}
            />
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-sm font-medium opacity-80">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              Protected by RentO Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
