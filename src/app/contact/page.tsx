import { CheckCircle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ContactForm from '@/components/contact/ContactForm';

const benefits = [
  { title: '在地競爭環境分析', sub: '你的競爭對手目前在做什麼' },
  { title: '免費 Local SEO 排名分析', sub: '找出最值得搶的搜尋字' },
  { title: '客製化方案建議', sub: '最適合你預算的服務組合' },
  { title: '競品廣告投放策略解析', sub: '諮詢後沒有強迫成交' },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="FREE CONSULTATION" title="立即諮詢" description="填寫以下表單，我們 24 小時內主動聯繫你" />

      <section className="py-16 px-6 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Info Panel */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 sticky top-24">
                <h3 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
                  準備好迎接新客流了嗎？
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  填寫表單後，資深顧問會在 24 小時內進行初步的店面品牌健檢。
                </p>
                <div className="space-y-5">
                  {benefits.map(({ title, sub }) => (
                    <div key={title} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#92400e] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm text-slate-800">{title}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">本月限量 5 個諮詢名額</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
                  填寫諮詢資料
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
