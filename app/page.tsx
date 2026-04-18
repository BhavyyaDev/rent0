import Link from 'next/link';
import { 
  Search, 
  Camera, 
  Speaker, 
  Gamepad2, 
  Laptop, 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSearchForm } from '@/components/hero-search-form';
import { prisma } from '@/lib/db';
import { ItemCard, Item } from '@/components/item-card';

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = [
    { name: 'Camera', icon: Camera, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Audio', icon: Speaker, color: 'bg-blue-50 text-blue-600' },
    { name: 'Gaming', icon: Gamepad2, color: 'bg-purple-50 text-purple-600' },
    { name: 'Tech', icon: Laptop, color: 'bg-orange-50 text-orange-600' },
  ];

  // 1. Fetch Recently Added
  let recentlyAddedRaw: any[] = [];
  try {
    recentlyAddedRaw = await prisma.item.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        owner: true,
        requests: {
          where: { status: 'accepted', endDate: { gte: new Date() } }
        }
      }
    });
  } catch (error) {
    console.error("Database error fetching recently added items:", error);
    recentlyAddedRaw = [];
  }

  // 2. Fetch Popular (by request count)
  let popularRaw: any[] = [];
  try {
    popularRaw = await (prisma as any).item.findMany({
      take: 5,
      include: { 
        owner: true,
        requests: {
          where: { status: 'accepted', endDate: { gte: new Date() } }
        },
        _count: {
          select: { requests: true }
        }
      },
      orderBy: {
        requests: {
          _count: 'desc'
        }
      }
    });
  } catch (error) {
    console.error("Database error fetching popular items:", error);
    popularRaw = [];
  }

  const recentlyAdded = recentlyAddedRaw as unknown as Item[];
  const popularItems = popularRaw as unknown as Item[];

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-black mb-8 animate-fade-in shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Trusted by 10,000+ creators</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 mb-10 leading-[0.95]">
              Access <span className="text-emerald-500">Pro Gear</span>,<br /> Locally.
            </h1>
            <p className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto font-bold leading-relaxed">
              Rent high-end cameras, audio gear, and tech from verified professionals in your community.
            </p>

            {/* Search Bar */}
            <HeroSearchForm />
          </div>
        </div>
      </section>

      {/* 1. Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-[32px] md:text-[40px] font-black tracking-tighter text-slate-950">Recently Added</h2>
              </div>
              <Link href="/explore" className="text-emerald-600 font-black hover:underline flex items-center gap-1.5 uppercase tracking-widest text-xs">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {recentlyAdded.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Category Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="flex flex-col gap-4 mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-[32px] md:text-[48px] font-black tracking-tighter text-slate-950 leading-none">Browse Categories</h2>
            <p className="text-xl text-slate-500 font-bold leading-relaxed">Discover specialized gear for your next professional project.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/search?category=${cat.name.toLowerCase()}`}>
                <div className="group bg-[#F8FAFC] p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-95">
                  <div className={`w-14 h-14 ${cat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <cat.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 mb-2">{cat.name}</h3>
                  <p className="text-slate-500 font-bold text-sm">Explore {cat.name.toLowerCase()} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Popular Gear Section */}
      {popularItems.length > 0 && (
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-[32px] md:text-[40px] font-black tracking-tighter text-slate-950">Popular Gear</h2>
              </div>
              <p className="hidden md:block text-slate-500 font-bold uppercase tracking-widest text-xs">Trending this week</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {popularItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col gap-4">
            <h2 className="text-[40px] md:text-[56px] font-black tracking-tighter text-slate-950 leading-none">How it Works</h2>
            <p className="text-xl text-slate-500 font-bold leading-relaxed">
              Our platform makes it easy and safe to rent professional equipment from your local community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative z-10 group">
                <div className="w-24 h-24 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-all duration-200 ease-in-out group-hover:shadow-md group-hover:-translate-y-0.5">
                  <step.icon className="w-10 h-10 text-slate-950" />
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-4">{step.title}</h3>
                <p className="text-slate-500 font-bold leading-relaxed">{step.description}</p>
                {idx < 2 && (
                   <div className="hidden lg:block absolute top-12 left-[65%] w-full h-0.5 border-t-2 border-dashed border-slate-100 -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 border-y border-slate-100 bg-white">
        <div className="container mx-auto px-6 md:px-10 lg:px-20">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">Verified Users</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500" />
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">Guaranteed Protection</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-950 text-white overflow-hidden relative border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col gap-8">
            <h2 className="text-[40px] md:text-[64px] font-black tracking-tighter leading-none">Ready to start creating?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-bold leading-relaxed">
              Join thousands of creators who use RentO to access the equipment they need, when they need it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
              <Link href="/explore">
                <Button className="rounded-full h-16 px-10 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-lg font-black shadow-md active:scale-95 transition-all duration-200 ease-in-out">
                  Start Exploring
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}