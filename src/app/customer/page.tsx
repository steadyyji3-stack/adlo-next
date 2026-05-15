import { redirect } from 'next/navigation';

export default async function CustomerIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string }>;
}) {
  const params = await searchParams;
  const query = params.customer_id ? `?customer_id=${encodeURIComponent(params.customer_id)}` : '';
  redirect(`/customer/dashboard${query}`);
}
