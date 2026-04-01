import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Item } from '@prisma/client';

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item.id}`} className="group block h-full outline-none">
      <Card className="h-full border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden flex flex-col bg-white">
        {/* Image Section - Proper Aspect Ratio */}
        <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 border-b border-slate-100/50">
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
          {/* Subtle overlay gradient on hover for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg text-slate-900 tracking-tight line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-5">
            {item.description}
          </p>
          
          <div className="mt-auto flex justify-between items-end">
            <div className="flex items-baseline gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
              <span className="font-extrabold text-lg">${item.pricePerDay.toFixed(2)}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">/ day</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
