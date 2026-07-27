import { NextRequest, NextResponse } from 'next/server';
import { readSubmissions, writeSubmissions } from '@/lib/submissions';
import { isAdminRequest } from '@/lib/admin-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: '請先登入後台' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const submissions = await readSubmissions();
    const filtered = submissions.filter((s) => s.id !== Number(id));

    if (filtered.length === submissions.length) {
      return NextResponse.json({ error: '找不到該筆資料' }, { status: 404 });
    }

    await writeSubmissions(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
