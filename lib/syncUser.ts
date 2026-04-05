import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';

export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return null;

    // We take the primary email address
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress 
      || user.emailAddresses[0]?.emailAddress 
      || '';

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;

    if (!email) return null; // Email is required in schema

    // Upsert the user in the database
    return await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email,
        name,
      },
      create: {
        id: user.id,
        email,
        name,
      },
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return null;
  }
}

