import { Store, ListChecks, ClipboardCheck, RefreshCw } from 'lucide-react';

const steps = [
  {
    icon: Store,
    title: '5 分鐘建檔',
    body: '四個短畫面填完店家資料、客群與招牌項目。不需要 SEO 知識，也不用交出 Google 帳號。',
  },
  {
    icon: ListChecks,
    title: '拿到本週任務',
    body: '系統依你的店家狀況，每週只給一件最值得做的事。趕時間就用 10 分鐘簡化版。',
  },
  {
    icon: ClipboardCheck,
    title: '完成並留下結果',
    body: '記下你做了什麼、前後數字如何。這些會累積成只有你有的歷史紀錄。',
  },
  {
    icon: RefreshCw,
    title: '系統調整下一週',
    body: '有改善就延續，沒變化就換方向。不是每週給你一樣的通用建議。',
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
            訂閱之後，每週長這樣
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
