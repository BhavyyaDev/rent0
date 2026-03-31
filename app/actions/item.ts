'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createItem(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string);
  const imageUrl = formData.get('imageUrl') as string;

  if (!title || !description || isNaN(pricePerDay)) {
    throw new Error('Invalid input');
  }

  const item = await prisma.item.create({
    data: {
      title,
      description,
      pricePerDay,
      imageUrl: imageUrl || null,
    },
  });

  revalidatePath('/');
  redirect(`/items/${item.id}`);
}
