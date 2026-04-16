import { redirect } from 'next/navigation';
import { confirmPayment } from '@/app/actions/request';
import { Loader2 } from 'lucide-react';

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const requestId = searchParams.requestId;

  if (searchParams.status === 'success' && typeof requestId === 'string') {
    try {
      await confirmPayment(requestId);
    } catch (err) {
      console.error('Failed to confirm payment on checkout page:', err);
    }
  }

  // Always redirect to dashboard after processing
  redirect('/dashboard');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
        <p className="text-lg font-bold text-slate-600">Completing your booking...</p>
      </div>
    </div>
  );
}
