'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';

export async function createItem(prevState: any, formData: FormData) {
  const user = await currentUser();
  if (!user) {
    return { error: 'You must be logged in to create an item.' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string);
  const imageUrl = formData.get('imageUrl') as string;

  if (!title || !description || isNaN(pricePerDay)) {
    return { error: 'Invalid input. Please check your fields.' };
  }

  try {
    console.log(`[Item Action] DB disabled - Mocking create item: "${title}" for userId: ${user.id}`);
    
    // We don't call prisma.item.create anymore
    const mockItem = {
      id: "mock-" + Math.random().toString(36).substring(7),
      title,
      description,
      pricePerDay,
      imageUrl: imageUrl || null,
      ownerId: user.id,
      createdAt: new Date(),
    };

    console.log(`[Item Action] Mock item created:`, mockItem);

    revalidatePath('/');
    return { success: true, itemId: mockItem.id };
  } catch (error) {
    console.error(`[Item Action] Failed to mock create item:`, error);
    return { error: 'Something went wrong while saving the item.' };
  }
}

