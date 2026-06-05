'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, ShieldCheck, PenLine, FileCheck2 } from 'lucide-react';

const STEPS = [
  {
    label: 'Day 0',
    title: '你預約',
    body: '留下聯絡方式 + Google Ads 與 GBP 的查看權限。1 個工作天內我們會回信確認。',
    Icon: Calendar,
  },
  {
    label: 'Day 1',
    title: '我們進帳戶',
    body: '安全查看廣告帳戶結構、關鍵字、CPC、GBP 設定。只看、不會更動任何設定。',
    Icon: ShieldCheck,
  },
  {
    label: 'Day 2',
    title: '分析 + 寫報告',
    body: '對比市場基準與競爭對手廣告，把發現拆成「該停／該加碼／該修補」三類。',
    Icon: PenLine,
  },
  {
    label: 'Day 3',
    title: '你拿到 PDF',
    body: '15–25 頁的 PDF 報告 + 3 件你本月可以直接執行的行動清單。',
    Icon: FileCheck2,
  },
];

/**
 * DiagnosticFlow — /diagnostic 頁面的「3 天時間軸」段落。
 *
 * 動效設計：
 * - 進入視口時觸發一次（IntersectionObserver, disconnect after）
 * - 連接線「畫」出來（scaleX 0 → 1，1400ms cubic-bezier）
 * - 4 個步驟卡 staggered fade-up（180ms 間距）
 * - 最後一步圖示加 ping pulse（聚焦「拿到報告」的價值點）
 * - prefers-reduced-motion: skip animation, show all immediately
 *
 * 響應式：mobile 直向、tablet/desktop 橫向 4 欄
 */
export default function DiagnosticFlow() {
  const ref = useRef<HTMLDivElement>(null);
  // 初始 state 同步檢查 prefers-reduced-motion：避免 reduced-motion 用戶
  // 在 hydration 首幀看到 opacity:0 閃爍。
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (visible) return; // reduced-motion 已開、無需 IntersectionObserver

    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="relative max-w-5xl mx-auto">
      {/* 桌面版水平連接線 — 在圖示中央水平線（top-8 對齊 size-16 圖示中心） */}
      <div
        className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 origin-left motion-safe:transition-transform motion-safe:duration-[1400ms] motion-safe:ease-out motion-safe:delay-300"
        style={{ transform: visible ? 'scaleX(1)' : 'scaleX(0)' }}
        aria-hidden
      />

      {/* role="list" 修補 Safari WebKit 當 ol 用 list-none 時失去清單語意 */}
      <ol role="list" className="grid grid-cols-1 md:grid-cols-4 gap-y-10 md:gap-x-6 relative list-none">
        {STEPS.map((step, idx) => {
          const { Icon } = step;
          const isLast = idx === STEPS.length - 1;
          return (
            <li
              key={step.label}
              className="text-center motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transitionDelay: visible ? `${500 + idx * 180}ms` : '0ms',
              }}
            >
              {/* 圖示圓 */}
              <div className="relative inline-flex justify-center">
                <div className="size-16 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center relative z-10 shadow-sm">
                  <Icon className="size-7 text-[#1D9E75]" aria-hidden />
                </div>
                {isLast && visible && (
                  <>
                    <span
                      className="absolute inset-0 rounded-full motion-safe:animate-ping bg-emerald-400/25"
                      aria-hidden
                    />
                    <span
                      className="absolute -inset-2 rounded-full border-2 border-emerald-400/30"
                      aria-hidden
                    />
                  </>
                )}
              </div>

              {/* 標籤 + 標題 + 內文 */}
              <div className="mt-4 text-xs font-bold tracking-[0.25em] text-emerald-700 uppercase">
                {step.label}
              </div>
              <h3 className="mt-2 text-lg md:text-xl font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
