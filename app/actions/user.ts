/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleUserRole(currentRole: string) {
  const user = await currentUser();
  if (!user) {
    return { error: 'Please sign in to modify your account settings.' };
  }

  const newRole = currentRole === 'lender' ? 'renter' : 'lender';

  try {
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { role: newRole },
    });

    // Revalidate dashboard and layout paths to trigger standard re-renders globally
    revalidatePath('/', 'layout');
    
    return { success: true, role: newRole };
  } catch (error) {
    console.error(`[User Action] Failed to toggle role:`, error);
    return { error: 'Oops! Something went wrong updating your settings.' };
  }
}

export async function completeOnboarding(role: 'renter' | 'lender') {
  const user = await currentUser();
  if (!user) return { error: 'Not authenticated' };

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    '';

  if (!email) return { error: 'No email address found on your account.' };

  try {
    // upsert instead of update: handles the case where syncUser() failed
    // silently and the row was never written, avoiding Prisma P2025.
    await (prisma as any).user.upsert({
      where: { id: user.id },
      update: { role },
      create: {
        id: user.id,
        email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
        role,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error(
      `[User Action] completeOnboarding failed for ${user.id} — code: ${error?.code} message: ${error?.message}`,
      error,
    );
    return { error: 'Failed to save selection' };
  }
}

export async function updateUserName(name: string) {
  const user = await currentUser();
  if (!user) return { error: 'Not authenticated' };
  if (!name.trim()) return { error: 'Name cannot be empty' };

  try {
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { name: name.trim() },
    });
    revalidatePath('/account');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(`[User Action] Failed to update name:`, error);
    return { error: 'Failed to update name. Please try again.' };
  }
}

export async function getAccountData() {
  const user = await currentUser();
  if (!user) return null;

  try {
    const dbUser = await (prisma as any).user.findUnique({
      where: { id: user.id },
    });

    const [itemsCount, requestsCount] = await Promise.all([
      prisma.item.count({ where: { ownerId: user.id } }),
      (prisma as any).request.count({ where: { renterId: user.id } }),
    ]);

    return { ...dbUser, itemsCount, requestsCount };
  } catch (error) {
    console.error(`[User Action] Failed to get account data:`, error);
    return null;
  }
}

export async function deleteAccount() {
  const user = await currentUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    await (prisma as any).user.delete({ where: { id: user.id } }).catch(() => {});
    return { success: true };
  } catch (error) {
    console.error(`[User Action] Failed to delete account:`, error);
    return { error: 'Failed to delete account. Please contact support.' };
  }
}
