import { currentUser } from '@clerk/nextjs/server';

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

    console.log("DB disabled - Mocking user sync");
    
    // Return a mock user object that matches the expected User type
    return {
      id: user.id,
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error syncing user:", error);
    return null;
  }
}

