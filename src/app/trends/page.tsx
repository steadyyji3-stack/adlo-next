import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHeader from '@/components/layout/PageHeader';
import TrendsWidget from '@/components/trends/TrendsWidget';
import KeywordSearchWidget from '@/components/trends/KeywordSearchWidget';

const insightCards = [
  { value: '+34%', label: '「附近」搜尋年增率' },
  { value: '#1', label: '台灣消費者找服務首選管道' },
  { value: '76%', label: '手機搜尋後當日到訪' },
  { value: '2.8×', label: '在地廣告轉換率 vs 全國' },
];

const widgets = [
  { id: 'widget-nearby', title: '「附近」在地搜尋熱度', desc: '關鍵字：附近餐廳、附近咖啡廳、附近診所', keywords: ['附近餐廳', '附近咖啡廳', '附近診所'] },
  { id: 'widget-gbp', title: 'Google 地圖行銷搜尋趨勢', desc: '關鍵字：Google 商家、地圖行銷、本地 SEO', keywords: ['Google 商家', '地圖行銷', '本地SEO'] },
  { id: 'widget-home', title: '到府服務類搜尋趨勢', desc: '關鍵字：到府清潔、到府安裝、到府維修', keywords: ['到府清潔', '到府安裝', '到府維修'] },
];

const keywords = [
  { kw: '附近餐廳', industry: '餐飲', trend: '↑ 高', trendColor: 'text-green-600', comp: '中', compColor: 'text-amber-600' },
  { kw: '[城市] 診所推薦', industry: '醫療', trend: '↑ 高', trendColor: 'text-green-600', comp: '高', compColor: 'text-red-500' },
  { kw: '到府清潔推薦', industry: '居家服務', trend: '↑ 高', trendColor: 'text-green-600', comp: '低', compColor: 'text-green-600' },
  { kw: '補習班 [地區]', industry: '教育', trend: '→ 穩定', trendColor: 'text-slate-500', comp: '中', compColor: 'text-amber-600' },
  { kw: '水電工 [城市]', industry: '居家修繕', trend: '↑ 高', trendColor: 'text-green-600', comp: '低', compColor: 'text-green-600' },
  { kw: '房屋仲介 [地區]', industry: '房產', trend: '→ 穩定', trendColor: 'text-slate-500', comp: '高', compColor: 'text-red-500' },
];

export default function TrendsPage() {
  return (
    <>
      <PageHeader eyebrow="MARKET INTELLIGENCE" title="趨勢分析" description="即時 Google Trends 數據，掌握台灣在地搜尋行為" />

      {/* Interactive Keyword Search */}
      <section className="py-12 px-6 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <Badge className="mb-2 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
              即時查詢
            </Badge>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
              你的關鍵字，台灣在地搜尋熱度如何？
            </h2>
          </div>
          <KeywordSearchWidget />
        </div>
      </section>

      {/* Insight Cards */}
      <section className="py-16 px-6 md:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {insightCards.map(({ value, label }) => (
              <Card key={label} className="border-slate-100 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-extrabold text-[#92400e] mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>{value}</div>
                  <div className="text-xs text-slate-500 leading-tight">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trends Widgets */}
      <section className="pb-16 px-6 md:px-8 max-w-5xl mx-auto space-y-8">
        {widgets.map(({ id, title, desc, keywords: kws }) => (
          <Card key={id} className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">{desc}</p>
                </div>
                <Badge variant="outline" className="text-[#92400e] border-amber-200 bg-amber-50 text-xs font-bold">
                  台灣 · 過去 12 個月
                </Badge>
              </div>
            </CardHeader>
            <TrendsWidget containerId={id} keywords={kws} />
          </Card>
        ))}
      </section>

      {/* Keywords Table */}
      <section className="py-16 px-6 md:px-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>台灣在地高搜尋量關鍵字</h2>
          <div className="w-16 h-0.5 bg-[#92400e] mb-10" />
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-500">關鍵字</TableHead>
                  <TableHead className="font-semibold text-slate-500">行業</TableHead>
                  <TableHead className="font-semibold text-slate-500">搜尋量趨勢</TableHead>
                  <TableHead className="font-semibold text-slate-500">競爭度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map(({ kw, industry, trend, trendColor, comp, compColor }) => (
                  <TableRow key={kw} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-slate-800">{kw}</TableCell>
                    <TableCell className="text-slate-500">{industry}</TableCell>
                    <TableCell className={`font-bold ${trendColor}`}>{trend}</TableCell>
                    <TableCell className={`font-medium ${compColor}`}>{comp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-8 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>找到你的關鍵字機會了嗎？</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">讓 adlo 幫你做完整的在地關鍵字研究，找出最有價值的搜尋切入點</p>
          <Button asChild size="lg" className="cta-gradient text-white font-bold hover:opacity-90 shadow-lg shadow-amber-900/20 px-12">
            <Link href="/contact">免費關鍵字評估 →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
