import { handleStripeWebhook } from '@/lib/stripe-webhook';

export const runtime = 'nodejs';
export const POST = handleStripeWebhook;
