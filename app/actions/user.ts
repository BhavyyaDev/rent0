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
