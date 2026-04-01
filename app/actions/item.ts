'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createItem(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string);
  const imageUrl = formData.get('imageUrl') as string;

  if (!title || !description || isNaN(pricePerDay)) {
    return { error: 'Invalid input. Please check your fields.' };
  }

  try {
    const item = await prisma.item.create({
      data: {
        title,
        description,
        pricePerDay,
        imageUrl: imageUrl || null,
      },
    });

    revalidatePath('/');
    return { success: true, itemId: item.id };
  } catch (error) {
    return { error: 'Something went wrong while saving the item.' };
  }
}
