import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Calendar, ShieldCheck, Camera } from 'lucide-react';
import { prisma } from '@/lib/db';
import { BookingWidget } from '@/components/booking-widget';

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;


  // Fetch the item from the database
  const item = await prisma.item.findUnique({
    where: { id },
    include: { owner: true }
  });

  if (!item) {
    notFound();
  }


  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 max-w-6xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Items
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Section */}
        <div className="rounded-[32px] overflow-hidden bg-slate-50 aspect-square relative border border-slate-200/60 shadow-sm flex items-center justify-center">
          {item?.imageUrl ? (
            <img src={item.imageUrl} alt={item?.title || 'Item'} className="object-cover w-full h-full" />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-slate-300" />
              </div>
              <span className="font-semibold text-lg text-slate-500">Image unvailable</span>
              <span className="text-sm">This owner hasn't uploaded a photo yet.</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col py-4">
          <Badge variant="outline" className="w-fit mb-5 rounded-full border-slate-200 text-emerald-600 px-3 py-1 shadow-sm font-semibold bg-emerald-50 text-sm">Available Now</Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 truncate">{item?.title || 'Untitled Item'}</h1>
          <div className="text-3xl font-semibold text-slate-900 mb-8">
            ${(item?.pricePerDay || 0).toFixed(2)} <span className="text-lg font-medium text-slate-500 tracking-normal">/ day</span>
          </div>

          <div className="prose prose-sm max-w-none flex-1 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base">{item?.description || 'No description provided by the owner.'}</p>
          </div>

          <Card className="rounded-3xl border border-slate-200/60 shadow-sm bg-slate-50/50 mb-6">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-slate-700">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                <span className="font-medium">RentO Protection Guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="h-6 w-6 text-blue-500" />
                <span className="font-medium">Minimum 1 day rental</span>
              </div>
            </CardContent>
          </Card>

          <BookingWidget pricePerDay={item.pricePerDay} />
        </div>
      </div>
    </div>
  );
}
