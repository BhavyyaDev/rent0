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
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Initial date validation
    if (parsedStart >= parsedEnd || parsedStart < todayMidnight) {
      return { error: 'Invalid state' };
    }

    // 2. Item existence and ownership check
    const item = await (prisma as any).item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return { error: 'Invalid state' };
    }

    if (item.ownerId === user.id) {
      return { error: 'Unauthorized' };
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
        status: 'pending',
      },
    });

    console.log(`[Request] Rental request created: ${itemId} for ${user.id}`);

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
      data: { 
        status,
      },
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
    // Explicit safe failure: assume unavailable if check fails to prevent double bookings
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
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Backend validation: Start must be before end, and start cannot be before today's date
    if (parsedStart >= parsedEnd || parsedStart < todayMidnight) {
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
    // 1. Mark accepted or active requests as completed if endDate has passed
    const toComplete = await (prisma as any).request.findMany({
      where: {
        status: { in: ['accepted', 'active'] },
        endDate: { lt: now }
      }
    });

    if (toComplete.length > 0) {
      console.log(`[Request Sync] Auto-completing ${toComplete.length} requests.`);
      await (prisma as any).request.updateMany({
        where: {
          id: { in: toComplete.map((r: any) => r.id) }
        },
        data: { 
          status: 'completed',
        }
      });
    }

    // 2. Mark accepted requests as active if their startDate has arrived
    const toActivate = await (prisma as any).request.findMany({
      where: {
        status: 'accepted',
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    if (toActivate.length > 0) {
      console.log(`[Request Sync] Auto-activating ${toActivate.length} requests.`);
      await (prisma as any).request.updateMany({
        where: {
          id: { in: toActivate.map((r: any) => r.id) }
        },
        data: { status: 'active' }
      });
    }

    // 3. Mark pending requests as rejected if startDate has passed before approval
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

// --- Formal Lifecycle System ---

/**
 * Owner accepts a pending request.
 */
export async function acceptRequest(requestId: string) {
  const user = await currentUser();
  if (!user) return { error: 'Authentication required' };

  try {
    const request = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { item: true }
    });

    if (!request || request.item.ownerId !== user.id) {
      return { error: 'Unauthorized' };
    }

    if (request.status !== 'pending') {
      return { error: 'Invalid state' };
    }

    // Check for conflicts before accepting
    const conflicts = await (prisma as any).request.findMany({
      where: {
        itemId: request.itemId,
        status: 'accepted',
        id: { not: requestId },
        startDate: { lte: request.endDate },
        endDate: { gte: request.startDate },
      },
    });

    if (conflicts.length > 0) {
      return { error: 'Item is already booked for these dates' };
    }

    await (prisma as any).request.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to accept request' };
  }
}

/**
 * Owner rejects a pending request.
 */
export async function rejectRequest(requestId: string) {
  const user = await currentUser();
  if (!user) return { error: 'Authentication required' };

  try {
    const request = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { item: true }
    });

    if (!request || request.item.ownerId !== user.id) {
      return { error: 'Unauthorized' };
    }

    if (request.status !== 'pending') {
      return { error: 'Invalid state' };
    }

    await (prisma as any).request.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to reject request' };
  }
}

import { stripe } from '@/lib/stripe';

/**
 * Create a Stripe checkout session and return the redirect URL.
 */
export async function createCheckoutSession(requestId: string) {
  const user = await currentUser();
  if (!user) return { error: 'Authentication required' };

  try {
    const request = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { item: true }
    });

    if (!request || request.renterId !== user.id) {
       return { error: 'Unauthorized' };
    }

    if (request.status !== 'accepted') {
       return { error: 'Invalid state' };
    }

    if (request.paymentStatus === 'paid') {
      return { error: 'Already processed' };
    }

    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
    const totalPrice = days * request.item.pricePerDay;

    // Use absolute URL for Stripe redirect
    // Use localhost for local dev if NEXT_PUBLIC_APP_URL is not set
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: request.item.title,
              description: `Rental from ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (${days} days)`,
            },
            unit_amount: Math.round(totalPrice * 100), // Stripe expects amount in sub-units (paise/cents)
          },
          quantity: 1,
        },
      ],
      metadata: {
        requestId,
        renterId: user.id,
      },
      success_url: `${baseUrl}/checkout?status=success&requestId=${requestId}`,
      cancel_url: `${baseUrl}/dashboard`,
    });

    console.log(`[Stripe] Checkout session created: ${session.id} for Request ${requestId}`);
    return { success: true, url: session.url };
  } catch (err) {
    console.error(`[Stripe Error] Session creation failed:`, err);
    return { error: 'Failed to initiate secure payment checkout' };
  }
}

import { auth } from '@clerk/nextjs/server';

/**
 * Handle successful payment confirmation.
 */
export async function confirmPayment(requestId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    const request = await (prisma as any).request.findUnique({
      where: { id: requestId }
    });

    if (!request) throw new Error("Request not found");

    if (request.renterId !== userId) {
      throw new Error("Not allowed");
    }

    const updated = await (prisma as any).request.update({
      where: { id: requestId },
      data: { 
        paymentStatus: 'paid',
        escrowStatus: 'held'
      }
    });

    revalidatePath('/dashboard');
    return updated;
  } catch (err) {
    console.error(`[Payment Confirmation] Failed for ${requestId}:`, err);
    throw err;
  }
}

/**
 * Handle handover: transitions from accepted to active.
 * Only allowed if paymentStatus is 'paid'.
 */
export async function markAsActive(requestId: string) {
  const user = await currentUser();
  if (!user) return { error: 'Authentication required' };

  try {
    const request = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { item: true }
    });

    if (!request || request.item.ownerId !== user.id) {
      return { error: 'Unauthorized' };
    }

    if (request.status !== 'accepted' || request.paymentStatus !== 'paid') {
      return { error: 'Invalid state' };
    }

    await (prisma as any).request.update({
      where: { id: requestId },
      data: { 
        status: 'active',
        escrowStatus: 'released'
      }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to mark as active' };
  }
}

/**
 * Fetch detailed request info for checkout.
 */
export async function getRequestDetails(requestId: string) {
  try {
    const request = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { item: true }
    });

    if (!request) return { error: 'Request not found' };

    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
    const totalPrice = days * request.item.pricePerDay;

    return {
      success: true,
      title: request.item.title,
      totalPrice,
      days,
    };
  } catch (err) {
    return { error: 'Failed to fetch request details' };
  }
}

/**
 * Handle return: transitions from active to completed.
 */
export async function markAsCompleted(requestId: string) {
  const user = await currentUser();
  if (!user) return { error: 'Authentication required' };

  try {
    const request = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { item: true }
    });

    if (!request || request.item.ownerId !== user.id) {
      return { error: 'Unauthorized' };
    }

    if (request.status !== 'active') {
      return { error: 'Invalid state' };
    }

    await (prisma as any).request.update({
      where: { id: requestId },
      data: { 
        status: 'completed',
      }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to complete request' };
  }
}
