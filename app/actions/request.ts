'use server';

import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function createRequest(itemId: string, startDate: string | Date, endDate: string | Date) {
  const user = await currentUser();
  if (!user) {
    return { error: 'You must be logged in to create a rental request.' };
  }

  if (!itemId || !startDate || !endDate) {
    return { error: 'Invalid input. Missing fields.' };
  }

  try {
    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    // Prevent double booking overlapping reservations
    const overlappingRequests = await (prisma as any).request.findMany({
      where: {
        itemId,
        status: 'accepted',
        startDate: { lte: parsedEnd },
        endDate: { gte: parsedStart },
      },
    });

    if (overlappingRequests.length > 0) {
      return { error: 'Item not available for selected dates' };
    }

    const request = await (prisma as any).request.create({
      data: {
        itemId,
        renterId: user.id,
        startDate: parsedStart,
        endDate: parsedEnd,
      },
    });

    console.log(`[Request Action] Rental request created in DB:`, request.id);

    return { success: true, requestId: request.id };
  } catch (error) {
    console.error(`[Request Action] Failed to create rental request:`, error);
    return { error: 'Something went wrong while submitting your request.' };
  }
}

import { revalidatePath } from 'next/cache';

export async function updateRequestStatus(requestId: string, status: string) {
  const user = await currentUser();
  if (!user) {
    return { error: 'You must be logged in to update requests.' };
  }

  try {
    const existingRequest = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { item: true }
    });

    if (!existingRequest || existingRequest.item.ownerId !== user.id) {
       return { error: 'Unauthorized to update this request.' };
    }

    await (prisma as any).request.update({
      where: { id: requestId },
      data: { status },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(`[Request Action] Failed to update request status:`, error);
    return { error: 'Something went wrong while updating the request.' };
  }
}

export async function checkAvailability(itemId: string, startDate: string | Date, endDate: string | Date) {
  try {
    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    const overlappingRequests = await (prisma as any).request.findMany({
      where: {
        itemId,
        status: 'accepted',
        startDate: { lte: parsedEnd },
        endDate: { gte: parsedStart },
      },
    });

    return { available: overlappingRequests.length === 0 };
  } catch (error) {
    console.error(`[Request Action] Failed to check availability:`, error);
    return { available: false, error: 'Failed to verify availability' };
  }
}
