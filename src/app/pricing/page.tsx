import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/layout/PageHeader';
import { CheckCircle, X, Zap, CheckCircle2, ClipboardList, Bot, BarChart2, ChevronRight } from 'lucide-react';
import PricingToggle from '@/components/pricing/PricingToggle';
import QuoteCalculator from '@/components/pricing/QuoteCalculator';

export const metadata: Metadata = {
  title: '定價方案 | adlo 台灣在地 SEO 行銷',
  description: '透明定價，六大服務方案。在地 SEO 方案 NT$8,800 起；數位市調 NT$15,000 起；AI 代管協助依工程評估報價。',
  alternates: { canonical: 'https://adlo.tw/pricing' },
  openGraph: {
    title: '定價方案 | adlo',
    description: '在地行銷 / 數位市調 / AI 代管三大類服務透明定價。',
    url: 'https://adlo.tw/pricing',
  },
};

export const plans = [
  {
    id: 'starter',
    name: '基礎版',
    nameEn: 'Starter',
    monthlyPrice: 8800,
    desc: '剛起步的店家，先把 Google 地圖排名做起來',
    highlight: false,
    badge: null,
    features: [
      { text: 'Google 商家檔案完整優化', included: true },
      { text: '每月 1 份排名健診報告', included: true },
      { text: '每月 4 篇商家貼文', included: true },
      { text: '評論管理策略建議', included: true },
      { text: 'Email 客服支援', included: true },
      { text: '在地 SEO 關鍵字佈局', included: false },
      { text: 'Google / Meta 廣告代管', included: false },
      { text: '客戶後台數據存取', included: false },
      { text: '月度視訊檢討會議', included: false },
    ],
    cta: '選擇基礎版',
    ctaHref: '/contact?plan=starter',
  },
  {
    id: 'growth',
    name: '成長版',
    nameEn: 'Growth',
    monthlyPrice: 18800,
    desc: '想要穩定增加客流量、關鍵字上首頁的店家',
    highlight: true,
    badge: '最多人選擇',
    features: [
      { text: 'Google 商家檔案完整優化', included: true },
      { text: '每月 1 份完整排名報告', included: true },
      { text: '每月 8 篇商家 + SEO 文章', included: true },
      { text: '評論管理策略 + 執行', included: true },
      { text: '優先 Line 客服支援', included: true },
      { text: '在地 SEO 佈局（10 個關鍵字）', included: true },
      { text: 'Google Ads 代管（廣告費 15% 服務費）', included: true },
      { text: '客戶後台數據存取', included: true },
      { text: '月度視訊檢討會議', included: false },
    ],
    cta: '選擇成長版',
    ctaHref: '/contact?plan=growth',
  },
  {
    id: 'pro',
    name: '旗艦版',
    nameEn: 'Pro',
    monthlyPrice: 32800,
    desc: '全面交給我們，你只需要專注做生意',
    highlight: false,
    badge: null,
    features: [
      { text: 'Google 商家檔案完整優化', included: true },
      { text: '每月完整數據分析報告', included: true },
      { text: '無限制 SEO 文章 + 廣告文案', included: true },
      { text: '評論管理 + 危機處理', included: true },
      { text: '專屬客戶經理 1 對 1', included: true },
      { text: '無限關鍵字 SEO 佈局', included: true },
      { text: 'Google + Meta 廣告全代管（廣告費 15% 服務費）', included: true },
      { text: '客戶後台 + PDF 月報自動寄送', included: true },
      { text: '月度視訊檢討 + 季度策略會議', included: true },
    ],
    cta: '選擇旗艦版',
    ctaHref: '/contact?plan=pro',
  },
];

/* ── 數位市調定價 ── */
const researchPlans = [
  {
    name: '快速市場掃描',
    price: 15000,
    duration: '5–7 個工作天',
    badge: null,
    items: [
      '核心關鍵字 Top 50 搜尋量分析',
      'AI 模擬市調偏好分布報告',
      '主要競爭對手 × 3 快速分析',
      '市場機會摘要報告（10–15 頁）',
      '1 次線上說明會（60 分鐘）',
    ],
  },
  {
    name: '完整市調報告',
    price: 38000,
    duration: '2–3 週',
    badge: '最多人選',
    items: [
      '關鍵字宇宙建立（500+ 關鍵字）',
      'AI 模擬市調 + 搜尋偏好分布',
      '競爭對手深度解構 × 5',
      '社群聆聽分析（PTT / Dcard / FB）',
      '消費者旅程地圖',
      '市場規模估算（TAM / SAM）',
      '完整報告（30–50 頁 PDF）',
      '2 次策略說明會 + 1 個月支援',
    ],
  },
  {
    name: '新產品上市研究',
    price: 68000,
    duration: '3–4 週',
    badge: null,
    items: [
      '目標族群深度訪談（5–8 人）',
      'AI 模擬市調 + 城市偏好差異分析',
      '產品定位測試',
      '競品價格策略分析',
      '上市關鍵字策略規劃',
      '渠道建議（哪個平台先打）',
      '完整上市市調報告',
      '3 次策略共識會議',
    ],
  },
];

/* ── AI 代管套餐（不公開價格）── */
const aiPlans = [
  {
    name: 'AI 入門套餐',
    badge: null,
    scope: '中小型客服自動化',
    items: [
      'AI 客服 Chatbot 建立（網站 + LINE）',
      '知識庫建立（FAQ 上傳訓練）',
      '基礎 n8n 流程 1 條',
      '月度 AI 表現報告',
      '3 小時團隊培訓',
    ],
  },
  {
    name: '企業 Agent 套餐',
    badge: '最多詢問',
    scope: '多平台整合 + CRM 串接',
    items: [
      '客製化企業 AI Agent 建立',
      '多平台部署（網站 / LINE / FB / 內部系統）',
      'n8n 流程 3 條（客製化）',
      'CRM 串接（Notion / Airtable / HubSpot）',
      '競爭對手自動監控系統',
      '每月維護 + 優化 + 月報',
    ],
  },
  {
    name: '全自動內容工廠',
    badge: null,
    scope: '內容生成與多平台自動發布',
    items: [
      '關鍵字研究 → AI 初稿生成管道',
      '多平台自動發布（部落格 / FB / IG / LINE）',
      'AI 圖片生成整合',
      '內容效果自動追蹤回報',
      '每月 30 篇內容自動產出',
    ],
  },
];

const faqs = [
  { q: '廣告代管費怎麼計算？', a: '廣告代管費為每月 NT$5,000 起，或廣告預算的 15%，取較高者。例如廣告預算 NT$50,000，代管費為 NT$7,500；預算 NT$20,000 以下則以 NT$5,000 計。廣告費由你直接支付給 Google / Meta 平台，不經過我們。' },
  { q: '合約最短幾個月？', a: '最短 3 個月。我們建議至少 6 個月，SEO 排名成效通常需要 90 天以上才會明顯穩定。' },
  { q: '年繳折扣怎麼計算？', a: '年繳（一次付 12 個月）享有 85 折優惠，等於省下約 2 個月費用。' },
  { q: '可以中途升級方案嗎？', a: '可以，隨時可以升級到更高方案，費用差額按比例計算。' },
  { q: '如果沒有效果怎麼辦？', a: '我們提供 60 天成效保證。若第 60 天排名未有明顯改善，我們將免費延長服務 30 天，直到達標。' },
  { q: '你們服務哪些地區？', a: '全台灣都服務，以台北、新北、台中、高雄為主要服務重心，其他縣市也歡迎諮詢。' },
  { q: 'AI 代管協助為什麼不公開價格？', a: '每個企業的流程複雜度、系統串接數量、知識庫規模都不同，導致工程量差異可能達 3–5 倍。我們需要先了解你的需求才能給出精確報價，通常在首次諮詢後 1–2 個工作天提供書面提案。' },
  { q: '數位市調的費用可以分期嗎？', a: '可以。完整市調報告與新產品上市研究可拆分為「啟動金 50% + 報告交付後 50%」兩期付款。' },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PageHeader
        eyebrow="服務方案"
        title="選擇適合你的方案"
        description="在地行銷訂閱 · 數位市調專案 · AI 代管協助——三大服務類型，靈活搭配"
      />

      {/* ── 01 在地行銷方案 ── */}
      <section className="py-16 px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#1D9E75]" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">月訂閱服務</p>
              <h2 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>在地行銷方案</h2>
            </div>
          </div>
          <PricingToggle plans={plans} />
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Zap className="w-4 h-4 text-[#1D9E75]" />
            <span>所有方案含 <strong className="text-slate-700">60 天成效保證</strong>，未達標免費延長服務</span>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 02 數位市調定價 ── */}
      <section className="py-16 px-6 md:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-[#1D9E75]" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">一次性專案</p>
              <h2 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>產品數位市調</h2>
            </div>
            <Link href="/services/market-research" className="ml-auto text-xs text-[#1D9E75] font-semibold flex items-center gap-1 hover:underline">
              了解服務詳情 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-slate-500 text-sm mb-10 pl-11">
            AI 模擬市調取代千人問卷，搜尋數據 + 社群聲量 + 競爭對手分析，數天交付報告。
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {researchPlans.map(plan => (
              <div key={plan.name}
                className={`rounded-2xl p-6 flex flex-col border ${plan.badge ? 'bg-[#E1F5EE] border-[#1D9E75]' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{plan.name}</h3>
                  {plan.badge && (
                    <span className="text-[10px] font-black bg-[#1D9E75] text-white px-2 py-0.5 rounded-full">{plan.badge}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-4">交付時程：{plan.duration}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-slate-400 text-sm">NT$</span>
                    <span className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
                      {plan.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">一次性專案費，完整市調報告可分期</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full cta-gradient text-white hover:opacity-90 font-bold">
                  <Link href={`/contact?service=market-research&package=${encodeURIComponent(plan.name)}`}>
                    索取此方案報價
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 03 AI 代管協助（不公開價格）── */}
      <section className="py-16 px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#1D9E75]" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">工程評估後報價</p>
              <h2 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>AI 代管協助 + 企業 Agent</h2>
            </div>
            <Link href="/services/ai-management" className="ml-auto text-xs text-[#1D9E75] font-semibold flex items-center gap-1 hover:underline">
              了解服務詳情 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-slate-500 text-sm mb-3 pl-11">
            每個企業的流程複雜度不同，工程量差異可達 3–5 倍，因此不公開定價。
            填寫需求後 1–2 個工作天提供書面提案，含建置費 + 月維護費明細。
          </p>

          {/* 說明提示 */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-10 ml-11">
            <ClipboardList className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>為什麼不公開報價？</strong>{' '}
              建置費因系統串接複雜度差異大（NT$35,000 至 NT$150,000+）；月維護費依功能規模而定。
              我們需要先了解你的業務流程，才能給出精確且合理的報價。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {aiPlans.map(plan => (
              <div key={plan.name}
                className="rounded-2xl p-6 flex flex-col border bg-slate-50 border-slate-200 hover:border-[#1D9E75]/40 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{plan.name}</h3>
                  {plan.badge && (
                    <span className="text-[10px] font-black bg-[#1D9E75] text-white px-2 py-0.5 rounded-full">{plan.badge}</span>
                  )}
                </div>
                <p className="text-xs text-[#1D9E75] font-semibold mb-4">{plan.scope}</p>

                {/* 代替價格的提示 */}
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6">
                  <p className="text-xs text-slate-400 mb-0.5">費用結構</p>
                  <p className="text-sm font-bold text-slate-700">建置費 + 月維護費</p>
                  <p className="text-xs text-slate-400 mt-0.5">諮詢後 1–2 天提供明細報價</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full cta-gradient text-white hover:opacity-90 font-bold">
                  <Link href={`/contact?service=ai-management&package=${encodeURIComponent(plan.name)}`}>
                    索取評估提案
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 自訂組合計算器 ── */}
      <section className="py-20 px-6 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
              專屬報價
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
              自訂你的在地行銷組合
            </h2>
            <p className="text-slate-500 text-sm">選擇服務項目，立即試算在地行銷月費估價</p>
          </div>
          <QuoteCalculator />
        </div>
      </section>

      {/* ── 付款方式 ── */}
      <section className="py-14 px-6 md:px-8 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              💳 目前承接方式
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="font-bold text-slate-800 mb-2">① 填寫詢問問卷</p>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  告訴我們你的商家類型、城市、目標，我們在 1–2 個工作天內回覆並提供專屬報價單。
                </p>
                <Button asChild className="cta-gradient text-white hover:opacity-90 w-full">
                  <Link href="/contact">前往填寫問卷 →</Link>
                </Button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="font-bold text-slate-800 mb-2">② 報價確認後匯款</p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  收到報價單並確認後，我們提供銀行匯款帳號。
                  款項確認後 1–2 個工作天內正式啟動服務。
                </p>
                <p className="text-xs text-slate-400 mt-3">
                  * 線上金流串接預計開放，敬請期待。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
              FAQ
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
              常見問題
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <Card key={q} className="border-slate-100">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-start gap-2">
                    <span className="text-[#1D9E75] font-mono text-sm mt-0.5">Q.</span>
                    {q}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed pl-5">{a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 md:px-8 bg-[#E1F5EE]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
            還不確定哪個方案適合你？
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            填寫免費諮詢表單，我們根據你的行業、地區、競爭環境，給你一份客製化建議，完全無壓力。
          </p>
          <Button asChild size="lg" className="cta-gradient text-white font-bold hover:opacity-90 shadow-lg shadow-green-900/20 px-12">
            <Link href="/contact">免費取得專屬方案建議 →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
