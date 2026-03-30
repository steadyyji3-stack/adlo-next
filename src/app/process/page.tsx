import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
import {
  MessageSquare, Cpu, FileText, Settings, BarChart3,
  Factory, Globe, Database, Shield, Lock, MessageCircle, TrendingUp
} from 'lucide-react';

const steps = [
  { num: 1, icon: MessageSquare, title: '填寫諮詢表單', day: 'Day 0', desc: '告訴我們你的行業、區域、目前遇到的行銷困境，以及你最想解決的問題。表單只需 2 分鐘。', badge: '完全免費，無任何費用', badgeColor: 'text-green-700 bg-green-50 border-green-100' },
  { num: 2, icon: Cpu, title: '24h 內聯繫 + 免費評估', day: 'Day 1', desc: '顧問 24 小時內透過電話或 LINE 聯繫，完成在地競爭環境免費分析，包含競爭對手現況、關鍵字機會、可預期成效。', badge: '提供書面評估報告', badgeColor: 'text-blue-700 bg-blue-50 border-blue-100' },
  { num: 3, icon: FileText, title: '客製化方案提案', day: 'Day 2–3', desc: '依據評估結果提供最適合的服務模組組合和報價。沒有套裝方案，每個案子都是量身訂做。', badge: '沒有強迫成交壓力', badgeColor: 'text-purple-700 bg-purple-50 border-purple-100' },
  { num: 4, icon: Settings, title: '簽約 + 48h 啟動', day: 'Day 4–5', desc: '確認合作後，執行團隊 48 小時內啟動所有服務：GBP 資訊更新、SEO 技術健診、廣告帳戶建立，全部同步進行。', badge: '業界最快啟動速度', badgeColor: 'text-amber-700 bg-amber-50 border-amber-100' },
  { num: 5, icon: BarChart3, title: '持續優化 + 月報', day: '每月持續', desc: '每月提供詳細成效報告，包含排名變化、流量數據、廣告成效。並根據數據持續優化策略，不斷提升投資回報率。', badge: '數據透明，隨時可查', badgeColor: 'text-blue-700 bg-blue-50 border-blue-100' },
];

const excellence = [
  { icon: Factory, title: '標準化 SOP', desc: '每個服務模組都有完整的標準作業流程，品質不因人員異動而波動' },
  { icon: Globe, title: '可擴展架構', desc: '系統支援多案場同步管理，同時服務多個在地客戶不會互相干擾' },
  { icon: Database, title: '數據驅動決策', desc: '每個優化動作都有數據支撐，不靠感覺做行銷' },
  { icon: Shield, title: '風險可控制', desc: '所有策略皆符合 Google 官方規範，不使用黑帽技術，保護你的長期排名' },
];

const guarantees = [
  { icon: Lock, title: '不鎖定長期合約', desc: '按月計費，隨時可停，我們用成效留住你，不用合約綁住你' },
  { icon: MessageCircle, title: 'LINE 即時溝通', desc: '專屬 LINE 群組，有問題隨時問，工作日 2 小時內回覆' },
  { icon: TrendingUp, title: '90 天成效保證', desc: '90 天內若關鍵字排名無明顯提升，退還當月服務費' },
];

export default function ProcessPage() {
  return (
    <>
      <PageHeader eyebrow="HOW IT WORKS" title="接單流程" description="從諮詢到上線，清晰透明的 5 個步驟" />

      {/* Steps */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === steps.length - 1;
              return (
                <div key={step.num} className="relative flex gap-8 pb-12">
                  {!isLast && (
                    <div className="absolute left-[35px] top-[64px] bottom-0 w-0.5 bg-gradient-to-b from-slate-200 to-transparent" />
                  )}
                  <div className="w-[72px] flex-shrink-0 flex flex-col items-center">
                    <div className={`w-[72px] h-[72px] rounded-full border-2 flex flex-col items-center justify-center shadow-md z-10 relative ${isLast ? 'border-slate-800 bg-slate-800' : 'border-[#92400e] bg-white shadow-amber-900/10'}`}>
                      <span className={`text-xl font-extrabold ${isLast ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: 'var(--font-manrope)' }}>{step.num}</span>
                      <Icon className={`w-4 h-4 mt-0.5 ${isLast ? 'text-amber-400' : 'text-[#92400e]'}`} />
                    </div>
                  </div>
                  <div className="pt-3 flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{step.day}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-3">{step.desc}</p>
                    <span className={`inline-flex items-center text-xs border rounded-lg px-3 py-2 font-medium ${step.badgeColor}`}>
                      {step.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Factory Excellence */}
      <section className="py-20 px-6 md:px-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>工廠級執行能力</h2>
            <div className="w-16 h-0.5 bg-[#92400e] mx-auto mb-4" />
            <p className="text-slate-500 text-sm">我們不是接案公司，我們是標準化流程的行銷工廠</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {excellence.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-slate-100">
                <CardContent className="flex gap-4 items-start p-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>我們的承諾</h2>
            <div className="w-16 h-0.5 bg-[#92400e] mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {guarantees.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="text-center border-slate-100 bg-slate-50">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Icon className="w-7 h-7 text-[#92400e]" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-8 bg-slate-50 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>準備好開始了嗎？</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">填寫諮詢表單，24 小時內我們會主動聯繫你</p>
          <Button asChild size="lg" className="cta-gradient text-white font-bold hover:opacity-90 shadow-lg shadow-amber-900/20 px-12">
            <Link href="/contact">立即填表諮詢 →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
