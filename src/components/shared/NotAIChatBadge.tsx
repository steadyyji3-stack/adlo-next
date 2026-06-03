import { Wand2 } from 'lucide-react';

interface Props {
  /**
   * 每個工具的「輸入 → 輸出」一句話。
   * 範例：「貼一個 URL → 10 維度 SEO 分數」
   */
  flow: string;
  /**
   * 第 2 行（選填）：稍微展開差異化或補充細節。
   * 不填則只顯示一行。
   */
  detail?: string;
  className?: string;
}

/**
 * 「不是 AI 聊天工具」品牌差異化卡片。
 * 統一散落在 /tools/* 各支工具 Hero 下方的視覺塊。
 *
 * 設計：emerald-200 邊、半透明白底、左 Wand2 icon、emerald-800 粗體標語。
 * 高度約 60-80px，不會擠壓 Hero 主訊息。
 */
export default function NotAIChatBadge({ flow, detail, className }: Props) {
  return (
    <div
      className={[
        'mx-auto max-w-xl flex items-start gap-3 text-left bg-white/70 backdrop-blur-sm border border-emerald-200 rounded-xl p-4',
        className ?? '',
      ].join(' ')}
    >
      <Wand2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" aria-hidden />
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        <strong className="text-emerald-800">不是 AI 聊天工具。</strong>
        {flow}。
        {detail && (
          <>
            <br />
            <span className="text-slate-600">{detail}</span>
          </>
        )}
      </p>
    </div>
  );
}
