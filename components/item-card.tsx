import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Item } from '@prisma/client';

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item.id}`} className="group block h-full">
      <Card className="h-full border border-slate-200/60 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] rounded-[24px] overflow-hidden flex flex-col bg-white">
        {item.imageUrl ? (
          <div className="w-full h-56 bg-slate-100 relative overflow-hidden">
            <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
          </div>
        ) : (
          <div className="w-full h-56 bg-slate-50 flex items-center justify-center text-slate-400 border-b border-slate-100/50">
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg text-slate-900 tracking-tight line-clamp-1 mb-1">{item.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">{item.description}</p>
          <div className="mt-auto flex items-baseline gap-1">
            <span className="font-bold text-lg text-slate-900">${item.pricePerDay.toFixed(2)}</span>
            <span className="text-sm text-slate-500 font-medium">/ day</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
