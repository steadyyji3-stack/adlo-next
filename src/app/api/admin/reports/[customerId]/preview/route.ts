import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { buildMonthlyReportPreview } from '@/lib/monthly-report';

export async function GET(request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { customerId } = await params;
    const month = request.nextUrl.searchParams.get('period') ?? undefined;
    const report = await buildMonthlyReportPreview(customerId, month);
    if (!report) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);

    return apiOk({ report });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_REPORT_MONTH') {
      return apiError('INVALID_REPORT_MONTH', 'period 必須是 YYYY-MM', 400);
    }
    console.error('[Admin Reports] preview failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('REPORT_PREVIEW_FAILED', '產生月報預覽失敗', 500);
  }
}
