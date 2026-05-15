import 'server-only';
import { NextRequest } from 'next/server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getCustomerIdFromRequest(request: NextRequest) {
  const fromCookie = request.cookies.get('customer_id')?.value;
  const fromQuery = request.nextUrl.searchParams.get('customer_id');
  return normalizeCustomerId(fromCookie ?? fromQuery);
}

export function getCustomerIdFromSearchParams(searchParams: { customer_id?: string }) {
  return normalizeCustomerId(searchParams.customer_id);
}

function normalizeCustomerId(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return UUID_PATTERN.test(trimmed) ? trimmed : null;
}
