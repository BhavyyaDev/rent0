import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-2xl tracking-tighter text-primary">
          RentO
        </Link>
        <div className="flex gap-2 items-center">
          <Link href="/items/add">
            <Button variant="ghost" className="rounded-full font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50">
              List an Item
            </Button>
          </Link>
          <Button className="rounded-full px-6 font-medium shadow-sm hover:shadow-md transition-shadow bg-primary text-primary-foreground">
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
}
