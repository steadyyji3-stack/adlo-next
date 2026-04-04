import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/layout/PageHeader';
import { CheckCircle, X, Zap } from 'lucide-react';
import PricingToggle from '@/components/pricing/PricingToggle';
import QuoteCalculator from '@/components/pricing/QuoteCalculator';

export const metadata: Metadata = {
  title: '定價方案 | adlo 台灣在地 SEO 行銷',
  description: '透明定價，三種在地行銷方案。基礎版 NT$8,800 起，含 Google 商家優化、在地 SEO、精準廣告。年繳享 85 折優惠。',
  alternates: { canonical: 'https://adlo.tw/pricing' },
  openGraph: {
    title: '定價方案 | adlo',
    description: '透明定價，三種在地行銷方案。NT$8,800 起，年繳 85 折。',
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

const faqs = [
  { q: '廣告代管費怎麼計算？', a: '廣告代管費為每月 NT$5,000 起，或廣告預算的 15%，取較高者。例如廣告預算 NT$50,000，代管費為 NT$7,500；預算 NT$20,000 以下則以 NT$5,000 計。廣告費由你直接支付給 Google / Meta 平台，不經過我們。' },
  { q: '合約最短幾個月？', a: '最短 3 個月。我們建議至少 6 個月，SEO 排名成效通常需要 90 天以上才會明顯穩定。' },
  { q: '年繳折扣怎麼計算？', a: '年繳（一次付 12 個月）享有 85 折優惠，等於省下約 2 個月費用。' },
  { q: '可以中途升級方案嗎？', a: '可以，隨時可以升級到更高方案，費用差額按比例計算。' },
  { q: '如果沒有效果怎麼辦？', a: '我們提供 60 天成效保證。若第 60 天排名未有明顯改善，我們將免費延長服務 30 天，直到達標。' },
  { q: '你們服務哪些地區？', a: '全台灣都服務，以台北、新北、台中、高雄為主要服務重心，其他縣市也歡迎諮詢。' },
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

const offerJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'adlo 在地行銷定價方案',
  itemListElement: plans.map((plan, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Offer',
      name: plan.name,
      description: plan.desc,
      price: plan.monthlyPrice,
      priceCurrency: 'TWD',
      priceSpecification: { '@type': 'UnitPriceSpecification', unitText: '月' },
      url: `https://adlo.tw/pricing`,
      seller: { '@id': 'https://adlo.tw/#organization' },
    },
  })),
};

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }} />
      <PageHeader
        eyebrow="PRICING"
        title="透明定價，沒有隱藏費用"
        description="按月付費，隨時可暫停。年繳享 85 折，省下 2 個月費用"
      />

      {/* Pricing Cards */}
      <section className="py-16 px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Toggle */}
          <PricingToggle plans={plans} />

          {/* Guarantee strip */}
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Zap className="w-4 h-4 text-[#1D9E75]" />
            <span>所有方案含 <strong className="text-slate-700">60 天成效保證</strong>，未達標免費延長服務</span>
          </div>
        </div>
      </section>

      <Separator />

      {/* Quote Calculator */}
      <section className="py-20 px-6 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
              專屬報價
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
              自訂你的行銷組合
            </h2>
            <p className="text-slate-500 text-sm">選擇服務項目，立即試算估價</p>
          </div>
          <QuoteCalculator />
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
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
