import { NextRequest, NextResponse } from 'next/server';
import { readSubmissions, writeSubmissions } from '@/lib/submissions';
import { SubmissionStatus } from '@/lib/types';

const VALID_STATUSES: SubmissionStatus[] = ['new', 'contacted', 'done'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: '無效狀態值' }, { status: 400 });
    }

    const submissions = await readSubmissions();
    const idx = submissions.findIndex((s) => s.id === Number(id));
    if (idx === -1) {
      return NextResponse.json({ error: '找不到該筆資料' }, { status: 404 });
    }

    submissions[idx].status = status;
    await writeSubmissions(submissions);

    return NextResponse.json({ success: true, submission: submissions[idx] });
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
