import assert from 'node:assert/strict';
import test from 'node:test';
import type Stripe from 'stripe';
import {
  getInvoiceSubscriptionId,
  serviceStatusForSubscription,
  shouldNotifyPaymentRecovered,
} from './billing-lifecycle';

test('reads a subscription id from the current Stripe invoice parent shape', () => {
  const invoice = {
    parent: {
      subscription_details: { subscription: 'sub_current' },
    },
  } as Stripe.Invoice;

  assert.equal(getInvoiceSubscriptionId(invoice), 'sub_current');
});

test('reads an expanded subscription from the current Stripe invoice parent shape', () => {
  const invoice = {
    parent: {
      subscription_details: { subscription: { id: 'sub_expanded' } },
    },
  } as Stripe.Invoice;

  assert.equal(getInvoiceSubscriptionId(invoice), 'sub_expanded');
});

test('keeps compatibility with legacy Stripe invoice events', () => {
  const invoice = { subscription: 'sub_legacy' } as unknown as Stripe.Invoice;
  assert.equal(getInvoiceSubscriptionId(invoice), 'sub_legacy');
  assert.equal(getInvoiceSubscriptionId({ parent: null } as Stripe.Invoice), null);
});

test('paid states never bypass onboarding', () => {
  assert.equal(serviceStatusForSubscription('trialing', 'not_started'), 'pending_onboarding');
  assert.equal(serviceStatusForSubscription('active', 'needs_revision'), 'pending_onboarding');
  assert.equal(serviceStatusForSubscription('past_due', 'pending_review'), 'pending_review');
  assert.equal(serviceStatusForSubscription('active', 'rejected'), 'paused');
  assert.equal(serviceStatusForSubscription('past_due', 'approved'), 'active');
});

test('terminal billing states override onboarding state', () => {
  assert.equal(serviceStatusForSubscription('unpaid', 'approved'), 'paused');
  assert.equal(serviceStatusForSubscription('incomplete', 'approved'), 'paused');
  assert.equal(serviceStatusForSubscription('paused', 'approved'), 'paused');
  assert.equal(serviceStatusForSubscription('cancelled', 'approved'), 'cancelled');
});

test('payment recovery follows prior customer attention even after subscription state already synced', () => {
  assert.equal(shouldNotifyPaymentRecovered({
    previousStatus: 'active',
    attemptCount: 1,
    hadPaymentAttention: true,
  }), true);
  assert.equal(shouldNotifyPaymentRecovered({
    previousStatus: 'past_due',
    attemptCount: 1,
    hadPaymentAttention: false,
  }), true);
  assert.equal(shouldNotifyPaymentRecovered({
    previousStatus: 'active',
    attemptCount: 2,
    hadPaymentAttention: false,
  }), true);
  assert.equal(shouldNotifyPaymentRecovered({
    previousStatus: 'active',
    attemptCount: 1,
    hadPaymentAttention: false,
  }), false);
});
