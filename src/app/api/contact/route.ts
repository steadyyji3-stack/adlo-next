import { NextRequest, NextResponse } from 'next/server';
import { readSubmissions, writeSubmissions } from '@/lib/submissions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, lineId, website, challenges, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: '姓名與電話為必填欄位' }, { status: 400 });
    }

    const submissions = await readSubmissions();
    const newEntry = {
      id: Date.now(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      lineId: String(lineId || '').trim(),
      website: String(website || '').trim(),
      challenges: Array.isArray(challenges) ? challenges : [],
      notes: String(notes || '').trim(),
      submittedAt: new Date().toISOString(),
      status: 'new' as const,
    };

    submissions.push(newEntry);
    await writeSubmissions(submissions);

    return NextResponse.json({ success: true, id: newEntry.id }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: '伺服器錯誤' }, { status: 500 });
  }
}
