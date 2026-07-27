import { NextRequest, NextResponse } from 'next/server';
import { readSubmissions } from '@/lib/submissions';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: '請先登入後台' }, { status: 401 });
  }

  try {
    const submissions = await readSubmissions();
    return NextResponse.json([...submissions].reverse());
  } catch {
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 });
  }
}
