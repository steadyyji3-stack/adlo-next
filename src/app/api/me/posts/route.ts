import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { listCustomerPosts } from '@/lib/customer-dashboard';

export async function GET() {
  const customerId = await getCustomerIdFromRequest();
  if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

  try {
    const posts = await listCustomerPosts(customerId);
    return apiOk({ posts });
  } catch (error) {
    console.error('[Customer Dashboard] posts failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_POSTS_FAILED', '讀取貼文資料失敗', 500);
  }
}
