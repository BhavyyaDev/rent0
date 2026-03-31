import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Item } from '@prisma/client';

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item.id}`} className="block transition-transform hover:-translate-y-1 hover:shadow-lg rounded-2xl overflow-hidden h-full">
      <Card className="h-full border shadow-sm rounded-2xl overflow-hidden flex flex-col bg-card">
        {item.imageUrl ? (
          <div className="w-full h-48 bg-muted relative">
            <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <CardHeader className="p-4 pb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-baseline gap-1 mt-auto">
          <span className="font-bold text-lg text-primary">${item.pricePerDay.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">/ day</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
