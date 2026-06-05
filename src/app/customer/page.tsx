import { redirect } from 'next/navigation';
import { isUnsignedCustomerIdAllowed } from '@/lib/customer-auth';
import { buildCustomerPathWithToken } from '@/lib/customer-link-token';

export default async function CustomerIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; customer_token?: string }>;
}) {
  const params = await searchParams;
  if (params.customer_token) {
    redirect(buildCustomerPathWithToken('dashboard', params.customer_token));
  }

  if (params.customer_id && isUnsignedCustomerIdAllowed()) {
    redirect(`/customer/dashboard?customer_id=${encodeURIComponent(params.customer_id)}`);
  }

  redirect('/customer/dashboard');
}
