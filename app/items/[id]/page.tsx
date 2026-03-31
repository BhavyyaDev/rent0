import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Items
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Section */}
        <div className="rounded-3xl overflow-hidden bg-muted aspect-square relative border shadow-sm">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              No Image Available
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit mb-4">Available Now</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{item.title}</h1>
          <div className="text-3xl font-semibold text-primary mb-6">
            ${item.pricePerDay.toFixed(2)} <span className="text-lg font-normal text-muted-foreground tracking-normal">/ day</span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none mb-8 flex-1">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>

          <Card className="rounded-2xl border-none shadow-sm bg-muted/50 mb-8">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span>RentO Protection Guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Minimum 1 day rental</span>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full rounded-2xl text-lg h-14">
            Rent Now
          </Button>
        </div>
      </div>
    </div>
  );
}
