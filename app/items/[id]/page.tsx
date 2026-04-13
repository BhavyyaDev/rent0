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

  // Sync statuses for accuracy
  await syncRequestStatuses();

  const item = await prisma.item.findUnique({
    where: { id },
    include: { owner: true }
  });

  const acceptedRequests = await (prisma as any).request.findMany({
    where: { itemId: id, status: 'accepted' },
    select: { startDate: true, endDate: true }
  });

  const bookedRanges = acceptedRequests.map((req: any) => ({
    from: req.startDate.toISOString(),
    to: req.endDate.toISOString()
  }));

  if (!item) notFound();

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0">
      {/* 1. Cinematic Hero Section */}
      <div className="w-full max-w-[1440px] mx-auto px-0 md:px-10 lg:px-20 md:pt-6">
        <div className="relative group overflow-hidden md:rounded-[32px] aspect-video md:aspect-[21/9] bg-slate-50 border-b md:border border-slate-200/60 shadow-sm transition-all duration-700">
          <Link href="/explore" className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all group-hover:bg-white">
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </Link>
          
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                 <Camera className="w-10 h-10 text-slate-300" />
               </div>
               <span className="font-bold text-lg">No image available</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24">
          
          {/* 2. LEFT COLUMN: Detailed Info */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-16">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                   <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100/50 hover:bg-emerald-50 rounded-full px-4 py-1.5 font-bold text-[11px] uppercase tracking-widest shadow-sm">Verified Gear</Badge>
                   <span className="text-slate-400 font-bold text-[13px] tracking-[0.2em] uppercase">{item.category || 'Equipment'}</span>
                </div>
                <h1 className="text-[36px] md:text-[56px] font-black text-slate-950 tracking-tight leading-[1.05] drop-shadow-sm">
                  {item.title}
                </h1>
              </div>

              {/* Owner Micro-Profile */}
              <div className="flex items-center gap-5 py-10 border-y-2 border-slate-100/80">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-xl transform group-hover:rotate-6 transition-transform">
                  <span className="text-white font-black text-2xl">{item.owner?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#222222]">Lended by {item.owner?.name || 'Owner'}</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-emerald-600">Verified Identity</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-sm font-bold text-slate-500">Member since {new Date(item.owner?.createdAt || '').getFullYear()}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      Trust {item.owner?.trustScore || 100}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Block */}
              <div className="py-2">
                <h3 className="text-2xl font-extrabold text-[#222222] mb-4">Description</h3>
                <p className="text-[17px] text-[#484848] leading-relaxed whitespace-pre-line font-medium italic">
                  {item.description}
                </p>
              </div>

              {/* Safety Badging Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                 <div className="p-6 rounded-[24px] bg-slate-50/50 border border-slate-100 flex flex-col gap-3">
                    <ShieldCheck className="w-8 h-8 text-slate-800" />
                    <div>
                      <h4 className="font-bold text-slate-900">Damage Protection</h4>
                      <p className="text-sm text-slate-500 font-medium">Your rental is secured with our damage protection plan.</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-[24px] bg-slate-50/50 border border-slate-100 flex flex-col gap-3">
                    <Camera className="w-8 h-8 text-slate-800" />
                    <div>
                      <h4 className="font-bold text-slate-900">Verified Listing</h4>
                      <p className="text-sm text-slate-500 font-medium">All gear photos are verified before they go live on RentO.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* 3. RIGHT COLUMN: Sticky Widget (Desktop) */}
          <div className="hidden lg:block relative">
            <div className="sticky top-28">
              <BookingWidget 
                itemId={item.id}
                itemTitle={item.title}
                pricePerDay={item.pricePerDay}
                bookedRanges={bookedRanges}
              />
              <div className="mt-6 flex flex-col items-center gap-2 opacity-60">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 100% Secure Checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MOBILE: Fixed Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-1 left-2 right-2 z-50 bg-white border border-slate-200/60 p-5 rounded-[28px] flex items-center justify-between shadow-[0_-12px_50px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-700">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-slate-950 tracking-tighter">₹{item.pricePerDay.toLocaleString()}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">/ per day</span>
        </div>
        
        <div className="w-[180px]">
           <BookingWidget 
              itemId={item.id}
              itemTitle={item.title}
              pricePerDay={item.pricePerDay}
              bookedRanges={bookedRanges}
            />
        </div>
      </div>
    </div>
  );
}
