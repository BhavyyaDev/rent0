import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

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

    const dbUser = await prisma.user.upsert({
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

    return dbUser;
  } catch (error) {
    console.error("Error syncing user to database:", error);
    return null;
  }
}
