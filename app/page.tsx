import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  Camera, 
  Speaker, 
  Gamepad2, 
  Laptop, 
  ShieldCheck, 
  Zap, 
  Users, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const categories = [
    { name: 'Camera', icon: Camera, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Audio', icon: Speaker, color: 'bg-blue-50 text-blue-600' },
    { name: 'Gaming', icon: Gamepad2, color: 'bg-purple-50 text-purple-600' },
    { name: 'Tech', icon: Laptop, color: 'bg-orange-50 text-orange-600' },
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white">
        <div className="container mx-auto px-6 md:px-10 lg:px-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-600 text-sm font-bold mb-8 animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Trusted by 10,000+ creators</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Access <span className="text-emerald-500">Pro Gear</span>,<br /> Locally.
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Rent high-end cameras, audio gear, and tech from verified professionals in your community.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-2 md:p-3 flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 w-full flex items-center px-4 gap-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  className="w-full h-12 outline-none text-slate-800 font-medium placeholder:text-slate-400"
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-slate-100 mx-2" />
              <div className="flex-1 w-full flex items-center px-4 gap-3">
                <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="text-slate-400 font-medium cursor-default">Add dates</span>
              </div>
              <Link href="/explore" className="w-full md:w-auto">
                <Button className="w-full md:w-auto rounded-full h-14 px-8 bg-slate-900 text-white hover:bg-slate-800 text-lg font-bold transition-all active:scale-95">
                  Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6 md:px-10 lg:px-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Browse by Category</h2>
            <Link href="/explore" className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/explore?category=${cat.name.toLowerCase()}`}>
                <div className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{cat.name}</h3>
                  <p className="text-slate-500 font-medium text-sm">Explore {cat.name.toLowerCase()} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32">
        <div className="container mx-auto px-6 md:px-10 lg:px-20">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 font-bold">How RentO Works</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Our platform makes it easy and safe to rent professional equipment from your local community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center mb-8 shadow-xl text-slate-900">
                  <step.icon className="w-8 h-8 font-bold" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4 font-bold">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.description}</p>
                {idx < 2 && (
                   <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 border-t-2 border-dashed border-slate-100 -z-10" />
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
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">Stripe Secure</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">Verified Users</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">Rental Protection</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 md:px-10 lg:px-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">Ready to start creating?</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Join thousands of creators who use RentO to access the equipment they need, when they need it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/explore">
                <Button className="rounded-full h-16 px-10 bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-lg font-bold shadow-lg shadow-emerald-500/20">
                  Start Exploring
                </Button>
              </Link>
              <Link href="/items/add">
                <Button variant="outline" className="rounded-full h-16 px-10 border-slate-700 text-white hover:bg-slate-800 text-lg font-bold">
                  List Your Gear
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}