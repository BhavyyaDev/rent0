'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function createItem(prevState: any, formData: FormData) {
  const user = await currentUser();
  if (!user) {
    return { error: 'You must be logged in to create an item.' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string);
  const imageUrl = formData.get('imageUrl') as string;
  const category = (formData.get('category') as string) || 'other';

  if (!title || !description || isNaN(pricePerDay)) {
    return { error: 'Invalid input. Please check your fields.' };
  }

  try {
    // Create the item in the database
    const item = await prisma.item.create({
      data: {
        title,
        description,
        pricePerDay,
        imageUrl: imageUrl || null,
        ownerId: user.id,
        category,
      } as any,
    });

    console.log(`[Item Action] Item created in DB:`, item.id);

    revalidatePath('/');
    revalidatePath('/search');
    return { success: true, itemId: item.id };
  } catch (error) {
    console.error(`[Item Action] Failed to create item:`, error);
    return { error: 'Something went wrong while saving the item.' };
  }
}

export async function updateItem(itemId: string, prevState: any, formData: FormData) {
  const user = await currentUser();
  if (!user) {
    return { error: 'You must be logged in to update an item.' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string);
  const imageUrl = formData.get('imageUrl') as string;
  const category = (formData.get('category') as string) || 'other';

  if (!title || !description || isNaN(pricePerDay)) {
    return { error: 'Invalid input. Please check your fields.' };
  }

  try {
    // Check ownership
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.ownerId !== user.id) {
      return { error: 'You do not have permission to update this item.' };
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        title,
        description,
        pricePerDay,
        imageUrl: imageUrl || null,
        category,
      } as any,
    });

    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath(`/items/${itemId}`);
    revalidatePath('/dashboard');
    return { success: true, itemId: updatedItem.id };
  } catch (error) {
    console.error(`[Item Action] Failed to update item:`, error);
    return { error: 'Something went wrong while updating the item.' };
  }
}

export async function deleteItem(itemId: string) {
  const user = await currentUser();
  if (!user) {
    return { error: 'You must be logged in to delete an item.' };
  }

  try {
    // Check ownership
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.ownerId !== user.id) {
      return { error: 'You do not have permission to delete this item.' };
    }

    await prisma.item.delete({
      where: { id: itemId },
    });

    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(`[Item Action] Failed to delete item:`, error);
    return { error: 'Something went wrong while deleting the item.' };
  }
}

