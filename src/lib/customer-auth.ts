import 'server-only';
import { auth } from '@/auth';

export async function getCustomerIdFromSession() {
  const session = await auth();
  return session?.user?.customerId ?? null;
}

export async function getCustomerIdFromRequest() {
  return getCustomerIdFromSession();
}

export async function getCustomerIdFromSearchParams() {
  return getCustomerIdFromSession();
}
