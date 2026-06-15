import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import {
  TrendingUp, Users, Search, MousePointerClick,
  CheckCircle2, ArrowRight, BarChart2, Building2, Store,
  ShoppingBag, ExternalLink, Target, Wrench, Eye,
} from 'lucide-react';

export const metadata: Metadata = {
  title: { absolute: '客戶成效案例 | adlo 台灣在地 SEO 行銷' },
  description: '實名公開追蹤：Baseus 台灣（3C 電商）、品威窗簾（北投在地店）——用 adlo 工具，從 Day-0 起點到結果，全程公開。加上早期合作案例：醫美年度新用戶 17 萬、電商新會員成長 374%。',
  alternates: { canonical: 'https://adlo.tw/cases' },
};

/**
 * 實名公開追蹤案例（證據引擎）。
 * 只放「真實 Day-0 起點數據 + 目標」，尚無成果——誠實框架本身是信任賣點。
 * baseline 數字皆來自 adlo 工具實測（seo-scorer / /check / keyword）。
 */
const liveCases = [
  {
    id: 'baseus',
    name: 'Baseus 台灣',
    url: 'https://www.baseus.com.tw',
    industry: '3C 配件電商',
    businessType: '電商品牌',
    icon: ShoppingBag,
    since: '2026 年 6 月',
    disclosure: 'adlo 創辦人親自操盤、全程公開——我們自己每天用 adlo 工具。',
    baseline: [
      { label: '官網 SEO 分數', value: '72–84', note: 'adlo seo-scorer 實測 11 頁，B 級' },
      { label: '內容通路', value: 'LINE OA + Blog', note: '已具備，缺每週穩定節奏' },
      { label: '先攻長尾關鍵字', value: '3 組', note: 'baseus 快充線 / 靈動系列 / type-c 充電線' },
    ],
    goal: '分類頁 SEO 72→80+、3 篇長尾文上線收錄、每週素材改由 adlo /my-week 產出。',
    tools: ['seo-scorer', 'keyword', '/my-week 電商模式'],
  },
  {
    id: 'pinwei',
    name: '品威窗簾傢飾',
    url: 'https://pinweicurtain.com',
    industry: '窗簾窗飾 / 到府服務',
    businessType: '在地店家',
    icon: Store,
    since: '2026 年 6 月',
    disclosure: null,
    baseline: [
      { label: '官網 SEO 分數', value: '84–96', note: 'adlo seo-scorer，A–B 級（網站本身做得好）' },
      { label: 'Google 商家', value: '近乎隱形', note: '/check 搜店名，回傳的竟是別家店' },
      { label: '主戰場關鍵字', value: '北投 窗簾', note: '在地長尾 + 到府丈量服務意圖' },
    ],
    goal: 'Google 商家從 0 建立、/check 拿到第一個分數、評論 0→N、「北投 窗簾」進地圖前 3。',
    tools: ['/check', '/my-week 在地店家模式', 'review-link', 'keyword'],
  },
];

const cases = [
  {
    id: 'pawnshop',
    label: '北部當鋪',
    industry: '當鋪 / 金融借貸',
    city: '台北',
    icon: Building2,
    services: ['在地 SEO', 'Google Ads', 'Meta 廣告'],
    challenge: '流量高度依賴單一社群平台（佔比 98%），平均停留時間不足 15 秒，廣告效益難以轉化為實際詢問。',
    solution: '重新規劃流量架構：SEO 建立在地關鍵字排名（汽機車借款、台北當鋪）、Google Ads 鎖定主動搜尋族群、Meta 廣告做再行銷。',
    results: [
      { label: 'CPC 廣告受眾停留時間', value: '3分15秒', note: '前：平均 10 秒' },
      { label: '廣告受眾品質提升', value: '20×', note: '相較社群短影音流量' },
      { label: '多平台流量佔比', value: '3 渠道', note: 'SEO / Google / Meta 同步佈局' },
    ],
    color: 'border-[#1D9E75]',
    highlight: false,
  },
  {
    id: 'clinic',
    label: '北部醫美診所',
    industry: '醫美診所',
    city: '台北',
    icon: Store,
    services: ['Meta 廣告', 'Google Ads', 'SEO 內容佈局'],
    challenge: '醫美市場競爭激烈，診所關鍵字如「除毛」「瘦小腿」被大型醫美集團壟斷，過去主要依賴 referral 口碑，流量不穩定。',
    solution: '多渠道並進：Meta 廣告觸及精準族群（性別 × 年齡 × 興趣圈定）、Google Ads 捕捉主動搜尋、同步建立 SEO 長尾關鍵字內容群。',
    results: [
      { label: '年度新使用者', value: '17 萬', note: '全年度累積（2025）' },
      { label: '自然搜尋流量', value: '3.9 萬', note: '有機 Google 搜尋新用戶' },
      { label: '廣告觸及規模', value: '12 萬+', note: 'Cross-network 工作階段' },
    ],
    color: 'border-[#1D9E75]',
    highlight: true,
  },
  {
    id: 'brand',
    label: '台灣電子3C品牌',
    industry: '電子品牌 / 電商',
    city: '全台',
    icon: BarChart2,
    services: ['在地 SEO', 'Google Ads', 'Meta 廣告', '內容行銷', 'AI 代管協助', '數位市調'],
    challenge: '電商平台流量成長停滯，會員數長期低成長，品牌在台灣市場的數位聲量不足，多渠道資源分散、缺乏整合策略。',
    solution: '全渠道整合：SEO + 廣告 + 內容行銷三位一體，同步導入 AI 自動化流程提升內容產出效率，並進行市場調研確立關鍵商品定位。',
    results: [
      { label: '累積會員突破', value: '破萬', note: '持續成長中' },
      { label: '電商新會員單期成長', value: '↑374%', note: '新增會員 1,653 人（單一期間）' },
      { label: '服務涵蓋範圍', value: '6 大模組', note: 'adlo 全包服務' },
    ],
    color: 'border-slate-200',
    highlight: false,
  },
];

const aggregate = [
  { icon: Users,            value: '34萬+', label: '累積觸及新用戶' },
  { icon: TrendingUp,       value: '374%',  label: '最高會員成長率' },
  { icon: Search,           value: '3+',    label: '成功服務客戶數' },
  { icon: MousePointerClick, value: '20×',  label: '廣告受眾品質提升' },
];

const caseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'adlo 客戶案例',
  itemListElement: [
    ...liveCases.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Article',
        name: `${c.name}：adlo 工具公開追蹤案例`,
        description: `${c.industry}。追蹤起點 ${c.since}，目標：${c.goal}`,
      },
    })),
    ...cases.map((c, i) => ({
      '@type': 'ListItem',
      position: liveCases.length + i + 1,
      item: {
        '@type': 'Article',
        name: `${c.label}：${c.industry} 行銷成效案例`,
        description: c.challenge,
      },
    })),
  ],
};

export default function CasesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(caseJsonLd) }} />

      <PageHeader
        eyebrow="CASE STUDIES"
        title="客戶案例"
        description="真實數據，不誇大。兩個正在公開追蹤的實名案例 + 早期合作成果。"
      />

      {/* ===== 實名公開追蹤 ===== */}
      <section className="bg-white py-14 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 tracking-widest text-xs font-bold uppercase mb-4">
              公開追蹤中
            </Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
              兩個實名案例，從第一天開始公開
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              多數行銷公司只給你看修好的成果。我們反過來——從 Day-0 起點就公開，包含起點有多糟。
              下面的數字是<strong className="text-slate-700"> adlo 工具實測的真實基準</strong>，不是承諾達成的成效。過幾個月回來，會看到一樣的工具把它推到哪。
            </p>
          </div>

          <div className="space-y-8">
            {liveCases.map((c) => {
              const Icon = c.icon;
              return (
                <article key={c.id} className="bg-white rounded-2xl border-2 border-[#1D9E75]/40 shadow-lg shadow-green-900/5 overflow-hidden">
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] border border-[#1D9E75]/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#1D9E75]" aria-hidden />
                      </div>
                      <div>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-extrabold text-slate-900 text-lg hover:text-[#0F6E56] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                          style={{ fontFamily: 'var(--font-manrope)' }}
                        >
                          {c.name}
                          <ExternalLink className="w-4 h-4 text-slate-400" aria-hidden />
                        </a>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <span className="text-xs text-slate-500">{c.industry}</span>
                          <span className="text-slate-300">·</span>
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[11px] font-semibold">{c.businessType}</Badge>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6E56] bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-full px-3 py-1.5">
                      <span className="relative flex h-2 w-2" aria-hidden>
                        <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      追蹤中 · 起點 {c.since}
                    </span>
                  </div>

                  {/* 揭露（Baseus） */}
                  {c.disclosure && (
                    <div className="px-8 py-3 bg-amber-50/60 border-b border-amber-100 flex items-start gap-2">
                      <Eye className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" aria-hidden />
                      <p className="text-xs text-amber-800 leading-relaxed"><strong>利益揭露：</strong>{c.disclosure}</p>
                    </div>
                  )}

                  {/* 內容 */}
                  <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {/* Day-0 基準 */}
                    <div className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Day-0 起點（adlo 工具實測）</p>
                      <div className="space-y-4">
                        {c.baseline.map((b, i) => (
                          <div key={i} className="flex items-start gap-4">
                            <BarChart2 className="w-4 h-4 text-[#1D9E75] shrink-0 mt-1" aria-hidden />
                            <div>
                              <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>{b.value}</p>
                              <p className="text-xs font-semibold text-slate-700">{b.label}</p>
                              <p className="text-xs text-slate-400">{b.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 目標 + 工具 */}
                    <div className="px-8 py-6 space-y-5">
                      <div>
                        <p className="text-xs font-bold text-[#1D9E75] uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" aria-hidden /> 接下來要做到
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed">{c.goal}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" aria-hidden /> 用到的 adlo 工具
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.tools.map((t) => (
                            <Badge key={t} className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-semibold">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 早期合作（匿名）===== */}
      <div className="bg-slate-50 border-y border-slate-200 px-6 py-3">
        <p className="max-w-5xl mx-auto text-xs text-slate-400 text-center">
          以下為早期合作案例，依當時保密約定匿名呈現，不揭露品牌名稱與網址。
        </p>
      </div>

      {/* 總體成效數字 */}
      <section className="bg-white py-14 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aggregate.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center p-6 rounded-2xl bg-[#E1F5EE] border border-[#1D9E75]/20">
                <Icon className="w-5 h-5 text-[#1D9E75] mx-auto mb-3" />
                <p className="text-3xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 案例列表 */}
      <section className="py-16 px-6 md:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-10">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <article key={c.id} className={`bg-white rounded-2xl border-2 ${c.highlight ? 'border-[#1D9E75] shadow-lg shadow-green-900/5' : 'border-slate-200'} overflow-hidden`}>
                {/* 案例 Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] border border-[#1D9E75]/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#1D9E75]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-extrabold text-slate-900 text-lg" style={{ fontFamily: 'var(--font-manrope)' }}>
                          {c.label}
                        </h2>
                        {c.highlight && (
                          <span className="text-[10px] font-black bg-[#1D9E75] text-white px-2 py-0.5 rounded-full">精選</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500">{c.industry}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{c.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.services.map(s => (
                      <Badge key={s} className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-semibold">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 案例內容 */}
                <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* 挑戰 + 解法 */}
                  <div className="px-8 py-6 space-y-5">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">面對的挑戰</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{c.challenge}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1D9E75] uppercase tracking-widest mb-2">adlo 的解法</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{c.solution}</p>
                    </div>
                  </div>

                  {/* 成效數字 */}
                  <div className="px-8 py-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">成效數字</p>
                    <div className="space-y-4">
                      {c.results.map((r, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                              {r.value}
                            </p>
                            <p className="text-xs font-semibold text-slate-700">{r.label}</p>
                            <p className="text-xs text-slate-400">{r.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 免責聲明 */}
      <section className="bg-white py-8 px-6 md:px-8 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-slate-400 leading-relaxed text-center">
            以上數據均來自實際合作期間的 GA4、Google Ads、Meta Ads Manager、Shopline 後台報表。
            成效因產業、競爭環境、合作期間長短而有所差異，不代表所有客戶均能達到相同結果。
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-8 bg-[#E1F5EE]">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="bg-white text-[#0F6E56] border-[#1D9E75]/30 mb-5">免費評估</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
            你的行業，我們也能做到
          </h2>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            告訴我們你的商家現況，我們提供免費競爭環境分析，
            <strong className="text-slate-900">讓數字說話，不賣空話。</strong>
          </p>
          <Button asChild size="lg" className="cta-gradient text-white shadow-xl hover:opacity-90 h-14 px-10 text-base">
            <Link href="/contact">
              免費取得競爭分析 <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
