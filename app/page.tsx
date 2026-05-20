import Link from 'next/link';
import {
  Camera,
  Speaker,
  Gamepad2,
  Laptop,
  Clock,
  TrendingUp,
  ShieldCheck,
  Users,
  Sparkles,
  Search,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { HeroSearchForm } from '@/components/hero-search-form';
import { prisma } from '@/lib/db';
import { ItemCard, Item } from '@/components/item-card';

export const dynamic = 'force-dynamic';

const categories = [
  {
    name: 'Camera',
    icon: Camera,
    href: '/search?category=camera',
    iconBg: 'bg-[#d4f07a]/20 group-hover:bg-[#d4f07a]',
  },
  {
    name: 'Audio',
    icon: Speaker,
    href: '/search?category=audio',
    iconBg: 'bg-blue-100/50 group-hover:bg-blue-100',
  },
  {
    name: 'Gaming',
    icon: Gamepad2,
    href: '/search?category=gaming',
    iconBg: 'bg-purple-100/50 group-hover:bg-purple-100',
  },
  {
    name: 'Tech',
    icon: Laptop,
    href: '/search?category=tech',
    iconBg: 'bg-orange-100/50 group-hover:bg-orange-100',
  },
];

const steps = [
  {
    title: 'Find Gear',
    description: 'Search for professional equipment near you with verified owners.',
    icon: Search,
  },
  {
    title: 'Book & Pay',
    description: 'Securely pay through our platform with Stripe protection.',
    icon: Zap,
  },
  {
    title: 'Rent & Create',
    description: 'Pick up your gear locally and start your creative project.',
    icon: Camera,
  },
];

export default async function Home() {
  let recentlyAddedRaw: any[] = [];
  try {
    recentlyAddedRaw = await prisma.item.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: true,
        requests: {
          where: { status: 'accepted', endDate: { gte: new Date() } },
        },
      },
    });
  } catch (error) {
    console.error('Database error fetching recently added items:', error);
  }

  let popularRaw: any[] = [];
  try {
    popularRaw = await (prisma as any).item.findMany({
      take: 4,
      include: {
        owner: true,
        requests: {
          where: { status: 'accepted', endDate: { gte: new Date() } },
        },
        _count: { select: { requests: true } },
      },
      orderBy: { requests: { _count: 'desc' } },
    });
  } catch (error) {
    console.error('Database error fetching popular items:', error);
  }

  const recentlyAdded = recentlyAddedRaw as unknown as Item[];
  const popularItems = popularRaw as unknown as Item[];

  return (
    <>
      {/* ── Fixed background orbs ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden">
        <div className="orb w-[500px] h-[500px] bg-[#d4f07a] top-[-100px] left-[-100px]" />
        <div
          className="orb w-[600px] h-[600px] bg-blue-200 bottom-[-200px] right-[-100px]"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="orb w-[400px] h-[400px] bg-[#d4f07a]/30 top-1/2 left-1/3"
          style={{ animationDelay: '-10s' }}
        />
        <div
          className="orb w-[500px] h-[500px] bg-[#d4f07a]/20 bottom-1/4 left-0"
          style={{ animationDelay: '-15s' }}
        />
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white/50 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#d4f07a] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Trusted by 10,000+ owners
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
          Access <span className="text-[#d4f07a]">Pro Gear</span>,<br />Locally.
        </h1>

        <p className="max-w-xl mx-auto text-gray-500 text-lg mb-12">
          Rent high-end cameras, audio gear, and tech from verified professionals in your community.
        </p>

        <HeroSearchForm />
      </section>

      {/* ── Recently Added ────────────────────────────────────── */}
      {recentlyAdded.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#d4f07a]/20">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Recently Added</h2>
            </div>
            <Link
              href="/explore"
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1a1a1a] transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {recentlyAdded.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* ── Browse Categories ─────────────────────────────────── */}
      <section className="bg-gray-50/30 py-32 border-y border-gray-100/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">Browse Categories</h2>
          <p className="text-gray-500 mb-16">
            Discover specialized gear for your next professional project.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href}>
                <div className="glass-card rounded-3xl p-10 flex flex-col items-start text-left group cursor-pointer">
                  <div className={`mb-6 p-4 rounded-2xl ${cat.iconBg} transition-colors`}>
                    <cat.icon className="w-6 h-6 text-gray-800" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{cat.name}</h4>
                  <p className="text-xs text-gray-400">
                    Explore {cat.name.toLowerCase()} listings
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Gear ──────────────────────────────────────── */}
      {popularItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100/50">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Popular Gear</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Trending This Week
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {popularItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-32 text-center relative">
        <h2 className="text-5xl font-bold mb-6">How it Works</h2>
        <p className="max-w-2xl mx-auto text-gray-500 mb-20 text-lg">
          Our platform makes it easy and safe to rent professional equipment from your local community.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="glass-card w-24 h-24 rounded-3xl flex items-center justify-center mb-8 bg-white/40">
                <step.icon className="w-8 h-8 text-[#1a1a1a]" />
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-12 mt-24">
          <div className="flex items-center gap-3 text-gray-500 font-medium">
            <ShieldCheck className="w-6 h-6 text-[#d4f07a]" />
            <span className="text-sm">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 font-medium">
            <Users className="w-6 h-6 text-[#d4f07a]" />
            <span className="text-sm">Verified Users</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 font-medium">
            <Sparkles className="w-6 h-6 text-[#d4f07a]" />
            <span className="text-sm">Guaranteed Protection</span>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="w-full bg-[#1a1a1a] py-32 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="orb w-[300px] h-[300px] bg-[#d4f07a]/10 top-[-100px] left-1/4 opacity-20" />
          <div className="orb w-[400px] h-[400px] bg-[#d4f07a]/10 bottom-[-150px] right-1/4 opacity-10" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl text-white font-bold mb-8">
            Ready to start creating?
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Join thousands of creators who use RentO to access the equipment they need, when they need it.
          </p>
          <Link href="/explore">
            <button className="bg-[#d4f07a] text-[#1a1a1a] px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform">
              Start Exploring
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold tracking-tighter">
            Rent<span className="text-[#d4f07a]">O</span>
          </div>
          <div className="text-xs text-gray-500">© 2025 RentO. All rights reserved.</div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-[#d4f07a] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#d4f07a] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
