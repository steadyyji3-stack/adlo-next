import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/layout/PageHeader';
import { MapPin, Search, PenLine, MousePointerClick, CheckCircle, Frown, TrendingDown, HelpCircle, Clock, Bot, BarChart2, ArrowRight } from 'lucide-react';
import { getAllNewServices } from '@/lib/new-services';

export const metadata: Metadata = {
  title: '服務方案 | adlo 台灣在地 SEO 行銷',
  description: '四大服務模組：Google 商家優化、在地 SEO、內容行銷、精準廣告投放。適合所有有在地顧客需求的生意。',
  alternates: { canonical: 'https://adlo.tw/services' },
};

const modules = [
  {
    id: 'gbp', num: '01', icon: MapPin, title: 'Google 商家檔案優化',
    desc: '讓你的商家出現在搜尋結果最顯眼的位置。包含商家資訊完整建置、關鍵字植入、相片策略與評論管理。',
    items: ['GBP 完整建置 / 修復', '關鍵字研究 + 植入', '每月 8 篇貼文維護', '5 星評論引導策略'],
  },
  {
    id: 'seo', num: '02', icon: Search, title: '在地 SEO 深度佈局',
    desc: '針對「[城市/區域]+[服務關鍵字]」做深度優化，讓你的網站穩定出現在潛在客戶面前。',
    items: ['在地關鍵字地圖建立', '網站技術 SEO 健診', '外部連結建立 (Link Building)', '每月排名追蹤報告'],
  },
  {
    id: 'content', num: '03', icon: PenLine, title: '內容行銷 × 廣告文案',
    desc: '透過精準在地化文章與廣告文案，吸引搜尋流量並提升轉換率。根據你的客群量身訂製投放建議。',
    items: ['每月 4 篇 SEO 文章', '廣告文案撰寫與優化', '社群貼文 × 視覺設計', '投放策略建議報告'],
  },
  {
    id: 'ads', num: '04', icon: MousePointerClick, title: '精準廣告投放',
    desc: 'Google 關鍵字廣告 + Meta 地理範圍廣告，根據你的客群與預算規劃最佳策略，最大化廣告效益。',
    items: ['廣告帳戶架設與健診', '地理圍欄 + 受眾設定', 'A/B 廣告素材測試', '每週成效分析報告'],
  },
];

const painPoints = [
  { icon: Frown,        title: '花了錢在廣告，卻沒有詢問電話', desc: '預算燒光，轉換率趨近於零，錢白花了' },
  { icon: TrendingDown, title: '競爭對手一直出現在搜尋第一名',  desc: '客戶直接找別人，你不知道流失了多少機會' },
  { icon: HelpCircle,   title: '不知道從哪裡開始做行銷',        desc: '社群、SEO、廣告，每個都說重要，卻沒人整合' },
  { icon: Clock,        title: '沒有時間親自管行銷',             desc: '每天忙著做生意，根本沒空研究 Google 演算法' },
];

const industries = [
  { icon: 'lucide:utensils',        label: '餐飲 / 咖啡廳' },
  { icon: 'lucide:stethoscope',     label: '診所 / 醫療' },
  { icon: 'lucide:scissors',        label: '美容 / 美髮' },
  { icon: 'lucide:wrench',          label: '居家修繕' },
  { icon: 'lucide:car',             label: '汽車 / 機車' },
  { icon: 'lucide:building-2',      label: '房仲 / 不動產' },
  { icon: 'lucide:graduation-cap',  label: '教育 / 補習班' },
  { icon: 'lucide:store',           label: '傳統零售 / 當鋪' },
  { icon: 'lucide:shopping-cart',   label: '電商品牌' },
  { icon: 'lucide:dumbbell',        label: '健身 / 運動' },
  { icon: 'lucide:paw-print',       label: '寵物服務' },
  { icon: 'lucide:plus-circle',     label: '其他行業' },
];

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'adlo 在地行銷服務模組',
  itemListElement: modules.map((m, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Service',
      name: m.title,
      description: m.desc,
      provider: { '@id': 'https://adlo.tw/#organization' },
      areaServed: { '@type': 'Country', name: '台灣' },
      serviceType: 'Local SEO Marketing',
    },
  })),
};

const newServices = getAllNewServices();

const newServiceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'ai-management': Bot,
  'market-research': BarChart2,
};

const newServiceColors: Record<string, { badge: string; icon: string; border: string }> = {
  'ai-management': { badge: 'bg-violet-500/10 text-violet-600 border-violet-200', icon: 'text-violet-500', border: 'hover:border-violet-200' },
  'market-research': { badge: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: 'text-blue-500', border: 'hover:border-blue-200' },
};

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <PageHeader
        eyebrow="SERVICE MODULES"
        title="服務方案"
        description="四大模組靈活組合，適合任何有在地顧客需求的生意"
      />

      {/* Pain Points */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
              你的痛點
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
              你正在面對這些問題嗎？
            </h2>
            <div className="w-16 h-0.5 bg-[#1D9E75] mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {painPoints.map(({ icon: PIcon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start bg-slate-50 rounded-xl p-6 border border-slate-100 card-hover">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Modules */}
      <section className="py-20 px-6 md:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
              核心服務
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              四大服務模組
            </h2>
            <p className="text-slate-500 text-sm">可單獨使用，也可組合搭配</p>
            <div className="w-16 h-0.5 bg-[#1D9E75] mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {modules.map(({ id, num, icon: MIcon, title, desc, items }) => (
              <Card key={id} id={id} className="card-hover border-slate-100 scroll-mt-20 group">
                <CardHeader className="pb-0 p-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#1D9E75] transition-colors">
                    <MIcon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                  </div>
                  <Badge variant="outline" className="text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] text-xs font-bold tracking-widest w-fit">
                    MODULE {num}
                  </Badge>
                  <h3 className="text-xl font-bold text-slate-800 mt-2">{title}</h3>
                </CardHeader>
                <CardContent className="p-8 pt-3">
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{desc}</p>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle className="w-4 h-4 text-[#1D9E75] flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 進階服務 */}
      <section className="py-20 px-6 md:px-8 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-white/10 text-white border-white/20 tracking-widest text-xs font-bold uppercase">
              進階服務
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
              AI 自動化 × 市場研究
            </h2>
            <p className="text-slate-400 text-sm">超越傳統行銷，讓 AI 和數據成為你最強的競爭力</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {newServices.map(svc => {
              const IconComp = newServiceIcons[svc.slug] ?? Bot;
              const colors = newServiceColors[svc.slug] ?? newServiceColors['ai-management'];
              return (
                <article key={svc.slug}
                  className={`bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col hover:border-slate-500 transition-all ${colors.border}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <IconComp className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div>
                      <Badge className={`text-xs font-bold border ${colors.badge}`}>{svc.nameEn}</Badge>
                    </div>
                    <span className="ml-auto text-[10px] font-black bg-[#1D9E75]/20 text-[#34d399] border border-[#1D9E75]/30 px-2 py-0.5 rounded-full">NEW</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{svc.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">{svc.tagline}</p>
                  <ul className="space-y-2 mb-8">
                    {svc.features.slice(0, 3).map(f => (
                      <li key={f.title} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className={`w-4 h-4 shrink-0 ${colors.icon}`} />
                        {f.title}
                      </li>
                    ))}
                    <li className="text-xs text-slate-500 pl-6">+ {svc.features.length - 3} 項更多功能…</li>
                  </ul>
                  <Link href={`/services/${svc.slug}`}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/10 hover:border-white/20">
                    了解詳情 <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industry Targets — Universal */}
      <section className="py-20 px-6 md:px-8 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
            服務對象
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
            任何有在地顧客需求的生意
          </h2>
          <p className="text-slate-500 text-sm mb-12">
            不論是傳統產業、新興電商、還是任何需要在地曝光的服務，我們都做得到
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {industries.map(({ icon: icoName, label }) => (
              <div
                key={label}
                className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center gap-3 hover:border-[#1D9E75]/40 hover:bg-[#E1F5EE] transition-colors cursor-default group"
              >
                <Icon
                  icon={icoName}
                  className="w-7 h-7 text-slate-400 group-hover:text-[#1D9E75] transition-colors"
                />
                <div className="text-xs font-semibold text-slate-600 text-center leading-tight">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-8">
            ＋ 當鋪、二手買賣、法律事務所、會計師事務所、工廠、批發商……只要你有在地客戶，就是我們的服務範圍
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-8 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
            不確定哪個方案適合你？
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            讓我們先幫你做免費評估，再決定最佳組合。諮詢完全無壓力。
          </p>
          <Button asChild size="lg" className="cta-gradient text-white font-bold hover:opacity-90 shadow-lg shadow-green-900/20 px-12">
            <Link href="/contact">免費諮詢 →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
