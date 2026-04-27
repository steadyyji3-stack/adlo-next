import { PackageCheck, Rocket, LineChart, RefreshCw } from 'lucide-react';

const steps = [
  {
    icon: PackageCheck,
    title: '登記 Waitlist',
    body: '選好方案，留下 email。開台前一週我們會寄信通知，首月 6 折自動套用。',
  },
  {
    icon: Rocket,
    title: '開台啟動（60 天後）',
    body: 'adlo 金流上線後，一鍵完成扣款與首次設定，不用合約、不綁約。',
  },
  {
    icon: LineChart,
    title: '每週工具 + 每月月報',
    body: '你平常用 adlo 免費工具累積的分數歷程，自動併入客戶月報，省你回顧時間。',
  },
  {
    icon: RefreshCw,
    title: '隨時調整 / 取消',
    body: '方案升降級或取消，後台一鍵完成。我們靠做得好留客，不靠合約鎖客。',
  },
];

export default function SubscribeHowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            從 Waitlist 到正式開台，四個步驟
          </h2>
          <p className="text-slate-600">
            不綁約、不押金、不強推——我們靠結果續訂，不靠合約。
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200"
              >
                <div className="w-11 h-11 rounded-xl bg-[#E1F5EE] text-[#1D9E75] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  步驟 {i + 1}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
