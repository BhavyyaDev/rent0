import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';

export async function syncUser() {
  const user = await currentUser();
  if (!user) return null;

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    '';

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;

  if (!email) {
    console.error(`[syncUser] No email found for Clerk user ${user.id} — skipping DB upsert`);
    return null;
  }

  try {
    return await prisma.user.upsert({
      where: { id: user.id },
      update: { email, name },
      create: { id: user.id, email, name },
    });
  } catch (error: any) {
    console.error(
      `[syncUser] DB upsert failed — userId: ${user.id}, email: ${email}, code: ${error?.code}, message: ${error?.message}`,
      error,
    );
    return null;
  }
}
