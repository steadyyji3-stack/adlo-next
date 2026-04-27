import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Clock,
  Activity,
  Filter,
  Target,
  Swords,
  MapPin,
  Search,
  PenLine,
  ListChecks,
  CheckCircle2,
  Quote,
  Lock,
} from 'lucide-react';
import DiagnosticFAQ from '@/components/diagnostic/DiagnosticFAQ';

export const metadata: Metadata = {
  title: 'Google Ads + GBP 健檢診斷 | adlo',
  description:
    '專人進你的帳戶做完整分析，3 個工作天交付 PDF 報告。找出現在在燒錢的關鍵字、GBP 缺口、競爭對手廣告策略。目前開放免費預約諮詢。',
  alternates: { canonical: 'https://adlo.tw/diagnostic' },
  openGraph: {
    title: '你每個月多燒多少錢，其實有個數字。',
    description: '進你的 Google Ads + GBP 後台做完整分析，3 個工作天交付 PDF 報告。目前開放免費預約諮詢。',
    url: 'https://adlo.tw/diagnostic',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

const DIAGNOSTIC_ITEMS = [
  {
    icon: Activity,
    title: 'Google Ads 帳戶結構評分',
    body: '我們按 Google 的 10 個品質維度檢查你的帳戶。你現在幾分、哪三個問題最影響你的廣告成效。',
  },
  {
    icon: Filter,
    title: '無效關鍵字清單',
    body: '哪些詞正在消耗預算卻從來沒有帶來轉換。清掉它們，平均可以釋放 20–35% 的廣告預算空間。',
  },
  {
    icon: Target,
    title: '出價效率分析',
    body: '你的 CPC 在市場中的位置在哪裡。哪些詞出太多、哪些詞出太少、哪裡可以重新分配。',
  },
  {
    icon: Swords,
    title: '競爭對手廣告解析（× 3 家）',
    body: '他們在打哪些關鍵字、廣告文案的主訴求是什麼、他們的著陸頁和你有什麼差距。',
  },
  {
    icon: MapPin,
    title: 'Google 商家（GBP）完整度稽核',
    body: '從類別設定、服務項目、照片規格到 Q&A 設定，列出影響在地搜尋排名的缺口清單。',
  },
  {
    icon: Search,
    title: '搜尋意圖對應檢查',
    body: '你的目標受眾在搜尋什麼詞——你的廣告有沒有在對的時機出現在對的位置。',
  },
  {
    icon: PenLine,
    title: '廣告文案品質分析',
    body: '你現有廣告的預期點擊率（CTR）是否符合市場基準。哪個廣告組合表現最差、文案要怎麼改。',
  },
  {
    icon: ListChecks,
    title: '本月優先行動清單',
    body: '報告最後整合出 3 件你這個月就可以執行的事。不用等代理商，直接做。',
  },
];

const TESTIMONIALS = [
  {
    body: '跑了一年廣告，第一次知道原來我花最多的那個詞，一個轉換都沒有。報告當天就停掉了，下個月省了快 NT$4,000。',
    who: '台中燒肉店',
    plan: '成長版客戶',
  },
  {
    body: '我以為 GBP 已經設定好了。報告給我看，光照片規格就有三個地方不對，排名後來第三週就往前跳了。',
    who: '新北美甲沙龍',
    plan: '基礎版客戶',
  },
  {
    body: '這份報告讓我決定不繼續找原來的廣告商，那個決定一個月省下超過 NT$15,000。',
    who: '台北選品店',
    plan: '旗艦版客戶',
  },
];

const REPORT_SAMPLES = [
  { title: '帳戶健康評分頁', desc: '10 個維度總分 + 三大待補項目' },
  { title: '無效關鍵字清單', desc: '帶燒錢速度、曝光卻零轉換的清單' },
  { title: '本月行動清單', desc: '3 件本月可執行、不用等代理商的事' },
];

export default function DiagnosticPage() {
  return (
    <>
      {/* ==================== SEGMENT 1 — Hero ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-8 text-center">
          <Badge
            variant="outline"
            className="mb-6 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase"
          >
            R-01 診斷報告 · 開放免費預約
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            你每個月多燒多少錢，
            <br />
            其實有個
            <span className="text-[#1D9E75]">數字</span>。
          </h1>

          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            我們進你的 Google Ads 帳戶和商家後台，
            <br className="hidden md:block" />
            用 3 個工作天告訴你那個數字是多少——
            <br className="hidden md:block" />
            以及你可以怎麼止血。
          </p>

          {/* 核心承諾三項 */}
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm md:text-base text-slate-700 mb-10">
            <li className="inline-flex items-center gap-2">
              <FileText className="size-4 text-[#1D9E75]" aria-hidden />
              3 個工作天交付 PDF
            </li>
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#1D9E75]" aria-hidden />
              目前開放免費預約
            </li>
            <li className="inline-flex items-center gap-2">
              <Clock className="size-4 text-[#1D9E75]" aria-hidden />
              1 個工作天內回覆
            </li>
          </ul>

          {/* 主 CTA */}
          <div className="flex flex-col items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-14 px-10 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base gap-2 focus-visible:ring-emerald-500"
            >
              <Link
                href="/contact"
                data-gtm-event="diagnostic_cta_click"
                data-gtm-cta-location="hero"
              >
                預約免費診斷諮詢
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <p className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Lock className="size-3.5" aria-hidden />
              留下聯絡方式即可，不用信用卡
            </p>
          </div>

          {/* Hero 輔助說明 */}
          <div className="mt-12 max-w-xl mx-auto text-xs md:text-sm text-slate-500 leading-relaxed border-t border-emerald-100 pt-6">
            <p className="inline-flex items-center gap-2 text-slate-600 font-medium mb-1">
              <Lock className="size-3.5 text-emerald-600" aria-hidden />
              需要：Google Ads 查看權限 + GBP 管理員權限
            </p>
            <p>我們只需要查看，不會更動你的設定。</p>
          </div>
        </div>
      </section>

      {/* ==================== SEGMENT 2 — 診斷內容 ==================== */}
      <section className="py-20 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="outline"
              className="mb-4 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase"
            >
              診斷報告包含
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              一份報告，做完這 6 件
              <br className="md:hidden" />
              你一直拖著沒查的事
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {DIAGNOSTIC_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="border-slate-200 hover:border-emerald-200 transition-colors">
                  <CardContent className="p-6 md:p-7">
                    <div className="flex items-start gap-4">
                      <div className="size-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Icon className="size-5 text-[#1D9E75]" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          <span className="text-emerald-600 mr-2">{String(idx + 1).padStart(2, '0')}</span>
                          {item.title}
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== SEGMENT 3 — 報告範例 ==================== */}
      <section className="py-20 md:py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase"
            >
              報告預覽
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
              長這樣——不是 PowerPoint，
              <br className="hidden md:block" />
              是可以直接用的分析
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              PDF 格式，15–25 頁。每個問題都附帳戶截圖和具體數字，不是通用建議。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {REPORT_SAMPLES.map((s, idx) => (
              <Card key={idx} className="overflow-hidden border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  {/* PDF 頁面模擬 */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-white to-emerald-50/50 p-5 border-b border-slate-100 relative">
                    <div className="text-[8px] text-slate-400 tracking-widest uppercase mb-2">adlo · 診斷報告</div>
                    <div className="text-[10px] font-bold text-slate-800 mb-3">{s.title}</div>
                    {/* 模糊數據線 */}
                    <div className="space-y-1.5">
                      <div className="h-2 w-3/4 bg-slate-200 rounded blur-[2px]" />
                      <div className="h-2 w-1/2 bg-slate-200 rounded blur-[2px]" />
                      <div className="h-2 w-5/6 bg-slate-200 rounded blur-[2px]" />
                    </div>
                    <div className="absolute bottom-4 left-5 right-5">
                      <div className="h-16 bg-gradient-to-t from-emerald-100 to-transparent rounded blur-[3px]" />
                    </div>
                    {/* 頁碼 */}
                    <div className="absolute top-4 right-5 text-[8px] text-slate-300">
                      P.{idx * 5 + 3}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{s.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 leading-relaxed">
            範例截圖為真實報告的匿名化版本。
            <br className="md:hidden" />
            你的報告會包含你帳戶的實際數字與截圖。
          </p>
        </div>
      </section>

      {/* ==================== SEGMENT 4 — 社會證明 ==================== */}
      <section className="py-20 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="outline"
              className="mb-4 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase"
            >
              客戶怎麼說
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              拿到報告之前，
              <br className="md:hidden" />
              他們也以為廣告沒問題
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, idx) => (
              <Card key={idx} className="border-slate-200 bg-gradient-to-b from-white to-emerald-50/30">
                <CardContent className="p-6 md:p-7 flex flex-col h-full">
                  <Quote className="size-7 text-emerald-200 mb-3" aria-hidden />
                  <p className="text-base text-slate-700 leading-relaxed flex-1 mb-6">「{t.body}」</p>
                  <div className="pt-4 border-t border-emerald-100">
                    <p className="text-sm font-semibold text-slate-900">—— {t.who}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.plan}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SEGMENT 5 — FAQ ==================== */}
      <section className="py-20 md:py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase"
            >
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
              你可能想先問的 8 個問題
            </h2>
          </div>
          <DiagnosticFAQ />
        </div>
      </section>

      {/* ==================== SEGMENT 6 — 為什麼目前免費 ==================== */}
      <section className="py-20 md:py-24 px-6 bg-[#E1F5EE]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-[#1D9E75] mb-6">
            <ShieldCheck className="size-7 text-white" aria-hidden />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            為什麼目前開放免費預約
          </h2>
          <div className="space-y-4 text-base md:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
            <p>adlo 還在產品早期階段，我們想先把報告做到讓人覺得值得。</p>
            <p>
              所以現在這一批預約——不收診斷費。
              <br className="hidden md:block" />
              條件是：你願意看完報告後給我們 15 分鐘，說說哪裡有用、哪裡沒用。
            </p>
            <p className="pt-3 text-slate-600">
              我們不靠一次性費用賺錢，靠的是你看完報告之後願意繼續合作。
              <br />
              所以把第一份報告做到位，對我們來說比收那筆診斷費更重要。
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-emerald-200/60 text-xs md:text-sm text-slate-600 space-y-1">
            <p>
              想直接聯絡我們：
              <a href="mailto:hello@adlo.tw" className="text-emerald-700 font-medium hover:underline">
                hello@adlo.tw
              </a>
            </p>
            <p>名額限制：每週 5 組，額滿下週再開放</p>
          </div>
        </div>
      </section>

      {/* ==================== SEGMENT 7 — 最終 CTA ==================== */}
      <section id="checkout" className="py-24 md:py-32 px-6 bg-gradient-to-b from-white via-emerald-50/30 to-emerald-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            你現在最需要的，
            <br />
            是知道自己的廣告
            <br className="md:hidden" />
            在哪個狀態。
          </h2>
          <p className="text-base md:text-xl text-slate-600 leading-relaxed mb-10">
            不用先簽合約，不用先決定要做多久。
            <br className="hidden md:block" />
            目前開放免費預約——3 天後你就有答案。
          </p>

          <Button
            asChild
            size="lg"
            className="h-16 px-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-lg gap-2 focus-visible:ring-emerald-500"
          >
            <Link
              href="/contact"
              data-gtm-event="diagnostic_cta_click"
              data-gtm-cta-location="final_cta"
            >
              預約免費診斷諮詢
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </Button>

          <ul className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-2 max-w-md mx-auto text-sm text-slate-600">
            {[
              '留下聯絡方式即可',
              '1 個工作天內回覆',
              '3 個工作天交付 PDF',
              '不符合條件會直接說',
            ].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#1D9E75] shrink-0" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <p className="mt-12 text-sm text-slate-500">
            想先看看我們怎麼幫客戶？
            <Link href="/cases" className="text-emerald-700 font-medium hover:underline ml-1">
              查看客戶案例 →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
