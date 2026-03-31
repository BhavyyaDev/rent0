import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl tracking-tight text-primary">
          RentO
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/items/add">
            <Button variant="ghost" className="rounded-xl">List an Item</Button>
          </Link>
          <Button className="rounded-xl px-6">Login</Button>
        </div>
      </div>
    </nav>
  );
}
