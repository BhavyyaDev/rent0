import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EditItemForm } from './edit-item-form';

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect('/sign-in');
  }

  const item = await prisma.item.findUnique({
    where: { id },
  });

  if (!item) {
    notFound();
  }

  // Ensure only the owner can edit
  if (item.ownerId !== userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[600px]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Edit Listing</h1>
          <p className="text-slate-500">Update the details of your rental item.</p>
        </div>
        
        <EditItemForm item={item} />
      </div>
    </div>
  );
}
