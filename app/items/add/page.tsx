'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createItem } from '@/app/actions/item';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-medium shadow-sm hover:shadow-md transition-shadow bg-primary text-primary-foreground" disabled={pending}>
      {pending ? 'Listing Item...' : 'List Item'}
    </Button>
  );
}

export default function AddItemPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-[600px]">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">List a New Item</h1>
        <p className="text-slate-500">Enter the details of the item you want to rent out.</p>
      </div>
      <Card className="rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
        <CardContent className="p-8 sm:p-10">
          <form action={createItem} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-slate-700 font-medium">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Sony A7III Camera"
                required
                className="rounded-2xl h-12 px-4 border-slate-200 focus:border-slate-300 focus:ring-slate-300"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="pricePerDay" className="text-slate-700 font-medium">Price per day ($)</Label>
              <Input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                step="0.01"
                min="1"
                placeholder="25.00"
                required
                className="rounded-2xl h-12 px-4 border-slate-200 focus:border-slate-300 focus:ring-slate-300"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="imageUrl" className="text-slate-700 font-medium">Image URL <span className="text-slate-400 font-normal">(Optional)</span></Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                className="rounded-2xl h-12 px-4 border-slate-200 focus:border-slate-300 focus:ring-slate-300"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your item in detail..."
                required
                className="min-h-[140px] rounded-2xl p-4 border-slate-200 focus:border-slate-300 focus:ring-slate-300 resize-none"
              />
            </div>

            <div className="pt-4">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
