import 'server-only';
import { NextRequest } from 'next/server';
import { verifyCustomerLinkToken } from '@/lib/customer-link-token';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getCustomerIdFromRequest(request: NextRequest) {
  const token = request.cookies.get('customer_token')?.value ?? request.nextUrl.searchParams.get('customer_token');
  const verifiedToken = verifyCustomerLinkToken(token);
  if (verifiedToken) return verifiedToken.customerId;

  if (!isUnsignedCustomerIdAllowed()) return null;

  const fromCookie = request.cookies.get('customer_id')?.value;
  const fromQuery = request.nextUrl.searchParams.get('customer_id');
  return normalizeCustomerId(fromCookie ?? fromQuery);
}

export function getCustomerIdFromSearchParams(searchParams: { customer_id?: string; customer_token?: string }) {
  const verifiedToken = verifyCustomerLinkToken(searchParams.customer_token);
  if (verifiedToken) return verifiedToken.customerId;

  if (!isUnsignedCustomerIdAllowed()) return null;

  return normalizeCustomerId(searchParams.customer_id);
}

export function getCustomerIdFromTokenOrDevFallback(input: { customer_id?: string; customer_token?: string }) {
  const verifiedToken = verifyCustomerLinkToken(input.customer_token);
  if (verifiedToken) return verifiedToken.customerId;

  if (!isUnsignedCustomerIdAllowed()) return null;

  return normalizeCustomerId(input.customer_id);
}

export function isUnsignedCustomerIdAllowed() {
  // DEV ONLY — never set in production.
  const isProductionDeploy = process.env.VERCEL_ENV === 'production' || process.env.APP_ENV === 'production';
  return process.env.ALLOW_UNSIGNED_CUSTOMER_ID === 'true' && !isProductionDeploy;
}

function normalizeCustomerId(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return UUID_PATTERN.test(trimmed) ? trimmed : null;
}
