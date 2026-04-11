'use server';

import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function createRequest(itemId: string, startDate: string | Date, endDate: string | Date) {
  const user = await currentUser();
  if (!user) {
    return { error: 'Please sign in to book your rental request.' };
  }

  if (!itemId || !startDate || !endDate) {
    return { error: 'Please select both a check-in and checkout date.' };
  }

  try {
    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    const now = new Date();

    // Backend validation: Start must be before end, and start cannot be in the past
    if (parsedStart >= parsedEnd || parsedStart < new Date(now.setMinutes(now.getMinutes() - 5))) {
      return { error: 'Invalid date selection' };
    }

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
    return { error: 'Oops! Something went wrong. Please try your request again.' };
  }
}

import { revalidatePath } from 'next/cache';

export async function updateRequestStatus(requestId: string, status: string) {
  const user = await currentUser();
  if (!user) {
    return { error: 'Please sign in to update this request.' };
  }

  try {
    const existingRequest = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { item: true }
    });

    if (!existingRequest || existingRequest.item.ownerId !== user.id) {
       return { error: 'Hmm, you do not seem to have permission to do that.' };
    }

    // NEW: If accepting, check for date conflicts first
    if (status === 'accepted') {
      const overlappingRequests = await (prisma as any).request.findMany({
        where: {
          itemId: existingRequest.itemId,
          status: 'accepted',
          id: { not: requestId }, // Don't count the current request itself
          startDate: { lte: existingRequest.endDate },
          endDate: { gte: existingRequest.startDate },
        },
      });

      if (overlappingRequests.length > 0) {
        return { error: 'Item not available for selected dates' };
      }
    }

    await (prisma as any).request.update({
      where: { id: requestId },
      data: { status },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(`[Request Action] Failed to update request status:`, error);
    return { error: 'Oops! We hit an error updating this. Please try again.' };
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
    return { available: false, error: 'Hmm, we had trouble checking those dates. Please try again.' };
  }
}

export async function deleteRequest(requestId: string) {
  const user = await currentUser();
  if (!user) {
    return { error: 'Please sign in to modify requests.' };
  }

  try {
    const existingRequest = await (prisma as any).request.findUnique({
      where: { id: requestId }
    });

    if (!existingRequest || existingRequest.renterId !== user.id) {
       return { error: 'Hmm, you do not seem to have permission to do that.' };
    }

    if (existingRequest.status !== 'pending') {
       return { error: 'You can only cancel pending requests. If already accepted, please contact the owner.' };
    }

    await (prisma as any).request.delete({
      where: { id: requestId }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(`[Request Action] Failed to delete request:`, error);
    return { error: 'Oops! We hit an error deleting this. Please try again.' };
  }
}

export async function updateRequestDates(requestId: string, startDate: string | Date, endDate: string | Date) {
  const user = await currentUser();
  if (!user) {
    return { error: 'Please sign in to modify requests.' };
  }

  try {
    const existingRequest = await (prisma as any).request.findUnique({
      where: { id: requestId }
    });

    if (!existingRequest || existingRequest.renterId !== user.id) {
       return { error: 'Hmm, you do not seem to have permission to do that.' };
    }

    if (existingRequest.status !== 'pending') {
       return { error: 'You can only edit pending requests.' };
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    const now = new Date();

    // Backend validation: Start must be before end, and start cannot be in the past
    if (parsedStart >= parsedEnd || parsedStart < new Date(now.setMinutes(now.getMinutes() - 5))) {
      return { error: 'Invalid date selection' };
    }

    // Check availability for the new dates, excluding the current request
    const overlappingRequests = await (prisma as any).request.findMany({
      where: {
        itemId: existingRequest.itemId,
        status: 'accepted',
        id: { not: requestId }, // Exclude this request
        startDate: { lte: parsedEnd },
        endDate: { gte: parsedStart },
      },
    });

    if (overlappingRequests.length > 0) {
      return { error: 'Item not available for selected dates' };
    }

    await (prisma as any).request.update({
      where: { id: requestId },
      data: {
        startDate: parsedStart,
        endDate: parsedEnd,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(`[Request Action] Failed to update request dates:`, error);
    return { error: 'Oops! We hit an error updating your dates. Please try again.' };
  }
}

export async function syncRequestStatuses() {
  const now = new Date();

  try {
    // 1. Mark accepted requests as completed if endDate has passed
    const acceptedToExpire = await (prisma as any).request.findMany({
      where: {
        status: 'accepted',
        endDate: { lt: now }
      }
    });

    if (acceptedToExpire.length > 0) {
      console.log(`[Request Sync] Auto-completing ${acceptedToExpire.length} requests.`);
      await (prisma as any).request.updateMany({
        where: {
          id: { in: acceptedToExpire.map((r: any) => r.id) }
        },
        data: { status: 'completed' }
      });
    }

    // 2. Mark pending requests as rejected if startDate has passed
    const pendingToExpire = await (prisma as any).request.findMany({
      where: {
        status: 'pending',
        startDate: { lt: now }
      }
    });

    if (pendingToExpire.length > 0) {
      console.log(`[Request Sync] Expiring ${pendingToExpire.length} pending requests.`);
      await (prisma as any).request.updateMany({
        where: {
          id: { in: pendingToExpire.map((r: any) => r.id) }
        },
        data: { status: 'rejected' }
      });
    }

    return { success: true };
  } catch (error) {
    console.error(`[Request Action] Status sync failed:`, error);
    return { error: 'Failed to sync statuses' };
  }
}
