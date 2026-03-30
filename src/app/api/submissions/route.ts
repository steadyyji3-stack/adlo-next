import { NextResponse } from 'next/server';
import { readSubmissions } from '@/lib/submissions';

export async function GET() {
  try {
    const submissions = await readSubmissions();
    return NextResponse.json([...submissions].reverse());
  } catch {
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 });
  }
}
