import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { listCustomerPosts } from '@/lib/customer-dashboard';

export async function GET(request: NextRequest) {
  const customerId = getCustomerIdFromRequest(request);
  if (!customerId) return apiError('UNAUTHORIZED', '客戶連結無法驗證，請從 adlo email 連結進入', 401);

  try {
    const posts = await listCustomerPosts(customerId);
    return apiOk({ posts });
  } catch (error) {
    console.error('[Customer Dashboard] posts failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_POSTS_FAILED', '讀取貼文資料失敗', 500);
  }
}
