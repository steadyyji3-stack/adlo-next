import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    return new NextResponse(`<html><body style="font-family:sans-serif;padding:40px"><h2>❌ 授權失敗：${error}</h2></body></html>`, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  if (!code) {
    return new NextResponse(`<html><body style="font-family:sans-serif;padding:40px"><h2>❌ 沒有收到 code</h2></body></html>`, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
    <head><title>Threads OAuth｜adlo</title></head>
    <body style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto">
      <h2 style="color:#1D9E75">✅ Threads 授權成功！</h2>
      <p>請複製以下 code 給 Kael：</p>
      <div style="background:#f0f0f0;padding:20px;border-radius:8px;word-break:break-all;font-size:13px;font-family:monospace">
        ${code}
      </div>
      <button onclick="navigator.clipboard.writeText('${code}')" 
        style="margin-top:12px;padding:10px 20px;background:#1D9E75;color:white;border:none;border-radius:6px;cursor:pointer">
        複製 Code
      </button>
      <p style="color:#888;font-size:12px;margin-top:20px">⚠️ 此 code 10 分鐘內有效，請立即複製給 Kael</p>
    </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
