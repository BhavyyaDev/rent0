import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// Must be nodejs runtime to read raw body for signature verification
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { requestId, renterId } = session.metadata ?? {};

    if (!requestId || !renterId) {
      console.error('[Stripe Webhook] Missing metadata on session:', session.id);
      // Return 200 so Stripe doesn't retry — this is a data issue, not a transient one
      return NextResponse.json({ received: true });
    }

    try {
      const request = await (prisma as any).request.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        console.error(`[Stripe Webhook] Request not found: ${requestId}`);
        return NextResponse.json({ received: true });
      }

      // Guard: metadata renterId must match the DB record
      if (request.renterId !== renterId) {
        console.error(`[Stripe Webhook] renterId mismatch for request ${requestId} — session ${session.id}`);
        return NextResponse.json({ received: true });
      }

      // Idempotency: skip if already confirmed
      if (request.paymentStatus === 'paid') {
        console.log(`[Stripe Webhook] Request ${requestId} already paid — skipping duplicate event`);
        return NextResponse.json({ received: true });
      }

      // Request must still be in accepted state to be payable
      if (request.status !== 'accepted') {
        console.error(`[Stripe Webhook] Request ${requestId} is in status '${request.status}', expected 'accepted'`);
        return NextResponse.json({ received: true });
      }

      const amountTotal = session.amount_total ?? 0;

      await (prisma as any).request.update({
        where: { id: requestId },
        data: {
          paymentStatus: 'paid',
          escrowStatus: 'held',
          totalPrice: amountTotal / 100, // convert paise → rupees
        },
      });

      console.log(`[Stripe Webhook] Payment confirmed — request ${requestId}, ₹${amountTotal / 100}`);
    } catch (err) {
      console.error(`[Stripe Webhook] DB update failed for request ${requestId}:`, err);
      // Return 500 so Stripe retries this event
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
