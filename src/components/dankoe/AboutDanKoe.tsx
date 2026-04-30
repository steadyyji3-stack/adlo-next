import { ExternalLink, Users, Coins, Clock, Pencil } from 'lucide-react';

interface Props {
  /** 'full' = 詳細版（index 頁用）/ 'compact' = 摘要版（單篇底部用） */
  variant?: 'full' | 'compact';
}

/**
 * 「關於 Dan Koe」介紹區塊。
 * - full：給 index 頁，3 段背景 + 4 個快速數據 + 為什麼台灣中小店家該看
 * - compact：給單篇 issue 頁底部，給第一次來的人一個快速 anchor
 */
export default function AboutDanKoe({ variant = 'full' }: Props) {
  if (variant === 'compact') {
    return (
      <aside
        aria-label="關於 Dan Koe"
        className="bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-6 my-10"
      >
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          關於 Dan Koe
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Dan Koe</strong> 是美國一人事業（solopreneur）創作者，
          X 追蹤 260 萬，主題圍繞寫作、AI 思維、注意力經濟、複利型內容。
          年收入超過 $400 萬美元、每天工作 2–4 小時——靠的是長尾內容資產而非流量爆點。
          adlo 每週挑出他最具實作價值的發文，附上對<strong className="text-slate-900">台灣中小店家</strong>的在地解析。
        </p>
        <p className="mt-3">
          <a
            href="https://x.com/thedankoe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1D9E75] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            追蹤 @thedankoe
          </a>
        </p>
      </aside>
    );
  }

  // full
  return (
    <section
      aria-label="關於 Dan Koe"
      className="bg-white border-b border-slate-100 py-12 px-6 md:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold text-[#0F6E56] uppercase tracking-widest mb-3">
          關於 Dan Koe
        </p>
        <h2
          className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-5 leading-tight"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          他是誰，為什麼值得每週讀一次？
        </h2>

        <div className="space-y-4 text-slate-700 leading-relaxed text-[15px] mb-8">
          <p>
            <strong className="text-slate-900">Dan Koe</strong> 是美國的一人事業
            （solopreneur）創作者，最為人知的身份是「寫作者 + 創業者」。X 追蹤 260 萬，
            主要在談寫作、注意力、AI 思維、一人事業的底層邏輯。
          </p>
          <p>
            他的特殊在於：年收入超過 $400 萬美元、團隊只有自己一個人、每天工作 2–4 小時。
            這個結果不是靠演算法 hack 或廣告投放，是靠
            <strong className="text-slate-900">十年複利型寫作</strong>累積出來的內容資產。
            一篇深度文章養他三年，一個觀點被引用幾百次。
          </p>
          <p>
            他講的東西看起來像「給創作者」，其實底層邏輯給任何「想被記得的小生意」都通用——
            選對的人說話、把專業變內容、不追爆紅追深度。adlo 每週週報就是把他最具實作價值的
            發文，翻成中文 + 加上<strong className="text-slate-900">台灣中小店家版的應用方法</strong>。
          </p>
        </div>

        {/* 4 個快速數據 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Users, label: 'X 追蹤', value: '260 萬+' },
            { icon: Coins, label: '年營收', value: '$4M USD+' },
            { icon: Clock, label: '每日工時', value: '2–4 小時' },
            { icon: Pencil, label: '寫作年資', value: '10+ 年' },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
            >
              <Icon
                className="w-4 h-4 text-[#1D9E75] mb-1.5"
                aria-hidden
              />
              <p className="text-xs text-slate-500 mb-0.5">{label}</p>
              <p className="text-base font-extrabold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {/* 為什麼台灣中小店家該讀 */}
        <div className="bg-[#E1F5EE]/50 border-l-4 border-[#1D9E75] pl-5 py-4 pr-4 rounded-r-lg">
          <p className="text-sm font-bold text-[#0F6E56] mb-1.5">
            為什麼台灣中小店家該讀他？
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            台灣老闆本來就是一人多工——產品、銷售、客服、行銷一人扛。Dan Koe 的「一人事業
            OS」就是寫給這種狀態的人看的。把他的 90% 觀念剪掉「美國市場」前綴，就直接適用
            台灣在地小店：怎麼用一篇文章養三年、怎麼讓客人主動找你、怎麼不靠廣告長期累積。
          </p>
        </div>

        <p className="mt-6 text-sm">
          <a
            href="https://x.com/thedankoe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#1D9E75] hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            到 X 追蹤 @thedankoe 原始發文
          </a>
        </p>
      </div>
    </section>
  );
}
