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
    <Button type="submit" className="w-full rounded-xl" disabled={pending}>
      {pending ? 'Listing Item...' : 'List Item'}
    </Button>
  );
}

export default function AddItemPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="rounded-3xl border shadow-sm">
        <CardHeader className="space-y-1 p-6">
          <CardTitle className="text-2xl font-bold">List a New Item</CardTitle>
          <CardDescription>
            Enter the details of the item you want to rent out.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form action={createItem} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Sony A7III Camera"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerDay">Price per day ($)</Label>
              <Input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                step="0.01"
                min="1"
                placeholder="25.00"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your item in detail..."
                required
                className="min-h-[120px] rounded-xl"
              />
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
