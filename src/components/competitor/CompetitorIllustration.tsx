'use client';

/** Hero 視覺：放大版六邊形雷達圖意象（對齊 post-writer 視覺重量） */
export default function CompetitorIllustration() {
  const SIZE = 240;
  const C = SIZE / 2;
  const R = 96;

  // 6 個頂點
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
  });

  // 你的店模擬分數（六邊形內，較大）
  const youPoints = [0.85, 0.72, 0.6, 0.78, 0.65, 0.82].map((ratio, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return { x: C + R * ratio * Math.cos(a), y: C + R * ratio * Math.sin(a) };
  });

  // 對手 A（橙）
  const compAPoints = [0.55, 0.62, 0.5, 0.58, 0.7, 0.45].map((ratio, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return { x: C + R * ratio * Math.cos(a), y: C + R * ratio * Math.sin(a) };
  });

  // 對手 B（紫，新增第 2 條增加層次）
  const compBPoints = [0.4, 0.5, 0.55, 0.45, 0.5, 0.6].map((ratio, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return { x: C + R * ratio * Math.cos(a), y: C + R * ratio * Math.sin(a) };
  });

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.reduce((acc, p, i) => `${acc}${i === 0 ? 'M' : 'L'}${p.x},${p.y} `, '') + 'Z';

  return (
    <div
      className="relative w-full max-w-[300px] sm:max-w-[380px] md:max-w-[440px] mx-auto h-52 sm:h-60 md:h-72 mb-8 md:mb-12"
      role="img"
      aria-label="同區三家店家的六維度雷達比較示意"
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
        {/* 背景柔光圓 */}
        <defs>
          <radialGradient id="hero-radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E1F5EE" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E1F5EE" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={R + 10} fill="url(#hero-radar-glow)" />

        {/* 同心六邊形（4 層） */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <path
            key={r}
            d={toPath(
              Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                return { x: C + R * r * Math.cos(a), y: C + R * r * Math.sin(a) };
              }),
            )}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            strokeOpacity={r === 1 ? 0.8 : 0.5}
          />
        ))}

        {/* 軸線 */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={C}
            y1={C}
            x2={p.x}
            y2={p.y}
            stroke="#cbd5e1"
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />
        ))}

        {/* 對手 B（紫，置最底） */}
        <path
          d={toPath(compBPoints)}
          fill="#a78bfa"
          fillOpacity="0.1"
          stroke="#a78bfa"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* 對手 A（橙） */}
        <path
          d={toPath(compAPoints)}
          fill="#fb923c"
          fillOpacity="0.12"
          stroke="#fb923c"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />

        {/* 你的線（主色，最前） */}
        <path
          d={toPath(youPoints)}
          fill="#1D9E75"
          fillOpacity="0.22"
          stroke="#1D9E75"
          strokeWidth="3"
        />
        {youPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="white"
            stroke="#1D9E75"
            strokeWidth="2.5"
          />
        ))}
      </svg>

      {/* 「+ 3 家」徽章 */}
      <div className="absolute -top-2 -right-1 sm:-right-3 bg-[#1D9E75] text-white text-xs sm:text-sm font-extrabold rounded-full px-3.5 py-1.5 shadow-lg ring-2 ring-white rotate-[8deg]">
        ＋ 3 家對手
      </div>

      {/* 飄浮裝飾點 */}
      <div className="absolute top-0 left-4 w-2 h-2 rounded-full bg-emerald-400 opacity-70" />
      <div className="absolute bottom-2 right-6 sm:right-10 w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-60" />
      <div className="absolute top-12 right-2 w-1 h-1 rounded-full bg-emerald-500 opacity-80 hidden sm:block" />
    </div>
  );
}
