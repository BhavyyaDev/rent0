'use client';

import { useActionState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createItem } from '@/app/actions/item';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';


export const dynamic = "force-dynamic";

export default function AddItemPage() {
  const [state, formAction, pending] = useActionState(createItem, null);

  if (state?.success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/50">
        <Card className="max-w-md w-full rounded-[32px] border border-slate-200/60 shadow-sm text-center p-10 bg-white">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Item Listed Successfully!</h2>
          <p className="text-slate-500 mb-8">Your item is now live and available for others to rent.</p>
          <Link href={`/items/${state.itemId}`} className="block">
            <Button className="w-full rounded-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-slate-800 shadow-sm">
              View Your Listing
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[600px]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">List a New Item</h1>
          <p className="text-slate-500">Enter the details of the item you want to rent out.</p>
        </div>

        <Card className="rounded-[32px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            {state?.error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 mb-6 border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{state.error}</p>
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-slate-800 font-semibold">Listing Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Sony A7III Mirrorless Camera"
                  required
                  className="rounded-2xl h-14 px-4 border-slate-200 bg-slate-50/50 focus-visible:ring-emerald-500 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="pricePerDay" className="text-slate-800 font-semibold">Price per day ($)</Label>
                <Input
                  id="pricePerDay"
                  name="pricePerDay"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="25.00"
                  required
                  className="rounded-2xl h-14 px-4 border-slate-200 bg-slate-50/50 focus-visible:ring-emerald-500 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="imageUrl" className="text-slate-800 font-semibold">Image URL <span className="text-slate-400 font-normal ml-1">(Optional)</span></Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="rounded-2xl h-14 px-4 border-slate-200 bg-slate-50/50 focus-visible:ring-emerald-500 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className="text-slate-800 font-semibold">Category</Label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl h-14 px-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select a category</option>
                    <option value="camera">Camera</option>
                    <option value="audio">Audio</option>
                    <option value="gaming">Gaming</option>
                    <option value="tech">Tech</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-slate-800 font-semibold">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your items condition, includes, and any rules..."
                  required
                  className="min-h-[140px] rounded-2xl p-4 border-slate-200 bg-slate-50/50 focus-visible:ring-emerald-500 resize-none text-base"
                />
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all bg-[#10b981] text-white hover:bg-[#059669]"
                >
                  {pending ? 'Publishing...' : 'Publish Listing'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
