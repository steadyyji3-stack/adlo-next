import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/layout/PageHeader';
import { MapPin, Search, PenLine, MousePointerClick, CheckCircle, Frown, TrendingDown, HelpCircle, Clock } from 'lucide-react';

const modules = [
  {
    id: 'gbp', num: '01', icon: MapPin, title: 'Google 商家檔案優化',
    desc: '讓你的商家出現在搜尋結果的「地圖三包廂」。包含商家資訊完整建置、關鍵字植入、相片策略與評論管理。',
    items: ['GBP 完整建置 / 修復', '關鍵字研究 + 植入', '每月 8 篇貼文維護', '5 星評論引導策略'],
  },
  {
    id: 'seo', num: '02', icon: Search, title: '在地 SEO 深度佈局',
    desc: '針對「[城市/區域]+[行業關鍵字]」做深度優化，讓你的網站穩定排名在搜尋結果第一頁。',
    items: ['在地關鍵字地圖建立', '網站技術 SEO 健診', '外部連結建立 (Link Building)', '每月排名追蹤報告'],
  },
  {
    id: 'content', num: '03', icon: PenLine, title: '在地內容行銷',
    desc: '透過精準的在地化文章吸引搜尋流量，搭配 Facebook / Instagram 社群貼文，建立品牌在地信任感。',
    items: ['每月 4 篇 SEO 文章', '每月 12 篇社群貼文', 'Canva 視覺設計', '在地事件/節慶文案'],
  },
  {
    id: 'ads', num: '04', icon: MousePointerClick, title: '精準廣告投放',
    desc: 'Google 關鍵字廣告 + Meta 地理範圍廣告，只向方圓 5 公里內的潛在客戶展示，最大化廣告效益。',
    items: ['Google Ads 帳戶架設', '地理圍欄廣告設定', 'A/B 廣告素材測試', '每週成效報告'],
  },
];

const painPoints = [
  { icon: Frown, title: '花了錢在廣告，卻沒有詢問電話', desc: '預算燒光，轉換率趨近於零，錢白花了' },
  { icon: TrendingDown, title: '競爭對手出現在 Google 地圖第一名', desc: '客戶直接打給別人，你不知道失去了多少單' },
  { icon: HelpCircle, title: '不知道從哪裡開始做行銷', desc: '社群、SEO、廣告，每個都說重要，卻沒人整合' },
  { icon: Clock, title: '沒有時間親自管行銷', desc: '每天忙著做生意，根本沒空研究 Google 演算法' },
];

const industries = [
  { emoji: '🍜', label: '餐飲 / 咖啡廳' },
  { emoji: '🔧', label: '居家修繕服務' },
  { emoji: '🏥', label: '診所 / 醫美' },
  { emoji: '🏠', label: '房仲 / 代銷' },
  { emoji: '📚', label: '補習班 / 才藝' },
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader eyebrow="SERVICE MODULES" title="服務方案" description="四大模組 × 五大行業，為你打造最適合的在地行銷組合" />

      {/* Pain Points */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>你正在面對這些問題嗎？</h2>
            <div className="w-16 h-0.5 bg-[#92400e] mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {painPoints.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start bg-slate-50 rounded-xl p-6 border border-slate-100 card-hover">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-red-400" />
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
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>四大服務模組</h2>
            <p className="text-slate-500 text-sm">可單獨使用，也可組合搭配</p>
            <div className="w-16 h-0.5 bg-[#92400e] mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {modules.map(({ id, num, icon: Icon, title, desc, items }) => (
              <Card key={id} id={id} className="card-hover border-slate-100 scroll-mt-20 group">
                <CardHeader className="pb-0 p-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-slate-800 transition-colors">
                    <Icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                  </div>
                  <Badge variant="outline" className="text-[#92400e] border-amber-200 bg-amber-50 text-xs font-bold tracking-widest w-fit">
                    MODULE {num}
                  </Badge>
                  <h3 className="text-xl font-bold text-slate-800 mt-2">{title}</h3>
                </CardHeader>
                <CardContent className="p-8 pt-3">
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{desc}</p>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
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

      {/* Industry Targets */}
      <section className="py-20 px-6 md:px-8 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>五大重點行業</h2>
          <p className="text-slate-500 text-sm mb-12">有在地客戶需求的行業，都是我們的強項</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {industries.map(({ emoji, label }) => (
              <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center hover:border-amber-200 hover:bg-amber-50 transition-colors cursor-default">
                <div className="text-3xl mb-3">{emoji}</div>
                <div className="text-sm font-semibold text-slate-700">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-8 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>不確定哪個方案適合你？</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">讓我們先幫你做免費評估，再決定最佳組合。諮詢完全無壓力。</p>
          <Button asChild size="lg" className="cta-gradient text-white font-bold hover:opacity-90 shadow-lg shadow-amber-900/20 px-12">
            <Link href="/contact">免費諮詢 →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
