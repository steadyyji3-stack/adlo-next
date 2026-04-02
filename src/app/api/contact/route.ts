import { NextRequest, NextResponse } from 'next/server';
import { readSubmissions, writeSubmissions } from '@/lib/submissions';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, lineId, website, industry, service, challenges, notes } = body;

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
      industry: String(industry || '').trim(),
      service: String(service || '').trim(),
      challenges: Array.isArray(challenges) ? challenges : [],
      notes: String(notes || '').trim(),
      submittedAt: new Date().toISOString(),
      status: 'new' as const,
    };

    submissions.push(newEntry);
    await writeSubmissions(submissions);

    // Send notification email if Resend is configured
    if (resend) {
      const challengeList = newEntry.challenges.length
        ? newEntry.challenges.map((c: string) => `• ${c}`).join('\n')
        : '（未選擇）';

      await resend.emails.send({
        from: 'adlo 系統通知 <hello@adlo.tw>',
        to: ['adlo.hello.tw@gmail.com'],
        subject: `【新諮詢申請】${newEntry.name}｜${newEntry.industry || '未填行業'}`,
        text: `
新諮詢申請 #${newEntry.id}
━━━━━━━━━━━━━━━━━

姓名：${newEntry.name}
電話：${newEntry.phone}
LINE ID：${newEntry.lineId || '未填'}
網站：${newEntry.website || '未填'}
行業：${newEntry.industry || '未填'}
服務需求：${newEntry.service || '未填'}

行銷挑戰：
${challengeList}

補充說明：
${newEntry.notes || '（無）'}

━━━━━━━━━━━━━━━━━
申請時間：${new Date(newEntry.submittedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
申請編號：#${newEntry.id}

請在 24 小時內聯繫客戶。
        `.trim(),
      });
    }

    return NextResponse.json({ success: true, id: newEntry.id }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: '伺服器錯誤' }, { status: 500 });
  }
}
