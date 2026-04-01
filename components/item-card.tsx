import Link from 'next/link';
import { Item } from '@prisma/client';

export function ItemCard({ item }: { item: Item }) {
  // Use a clean, premium placeholder if no image exists
  const displayImage = item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  return (
    <Link href={`/items/${item.id}`} className="group block h-full outline-none">
      <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden">
        
        {/* Image Section */}
        <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden">
          <img 
            src={displayImage} 
            alt={item.title} 
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105" 
          />
          
          {/* Subtle overlay gradient on hover for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {/* Available Badge */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm border border-slate-100">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Available</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg text-slate-900 tracking-tight line-clamp-1 mb-0.5 group-hover:text-emerald-600 transition-colors">
            {item.title}
          </h3>
          
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-1 mb-4 flex-grow">
            {item.description}
          </p>
          
          <div className="mt-auto">
            <p className="font-semibold text-slate-900">
              <span className="text-[17px]">₹{item.pricePerDay.toLocaleString()}</span>
              <span className="text-sm text-slate-500 font-normal ml-1">/ day</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
