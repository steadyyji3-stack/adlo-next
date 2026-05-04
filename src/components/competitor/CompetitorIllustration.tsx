'use client';

/** Hero 視覺：簡化版六邊形雷達圖意象 */
export default function CompetitorIllustration() {
  const SIZE = 220;
  const C = SIZE / 2;
  const R = 80;

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

  // 對手線（較小）
  const compPoints = [0.55, 0.62, 0.5, 0.58, 0.7, 0.45].map((ratio, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return { x: C + R * ratio * Math.cos(a), y: C + R * ratio * Math.sin(a) };
  });

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.reduce((acc, p, i) => `${acc}${i === 0 ? 'M' : 'L'}${p.x},${p.y} `, '') + 'Z';

  return (
    <div
      className="relative w-full max-w-[260px] mx-auto h-44 sm:h-52 md:h-56 mb-8 md:mb-10"
      role="img"
      aria-label="同區三家店家的六維度雷達比較示意"
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
        {/* 同心六邊形 */}
        {[0.33, 0.66, 1].map((r) => (
          <path
            key={r}
            d={toPath(
              Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                return { x: C + R * r * Math.cos(a), y: C + R * r * Math.sin(a) };
              }),
            )}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* 軸線 */}
        {points.map((p, i) => (
          <line key={i} x1={C} y1={C} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />
        ))}

        {/* 對手線（橙） */}
        <path
          d={toPath(compPoints)}
          fill="#fb923c"
          fillOpacity="0.12"
          stroke="#fb923c"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />

        {/* 你的線（主色） */}
        <path
          d={toPath(youPoints)}
          fill="#1D9E75"
          fillOpacity="0.2"
          stroke="#1D9E75"
          strokeWidth="2.5"
        />
        {youPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#1D9E75" strokeWidth="2" />
        ))}
      </svg>

      {/* 「+ 3 家」徽章 */}
      <div className="absolute -top-1 -right-1 sm:-right-2 bg-[#1D9E75] text-white text-xs font-extrabold rounded-full px-3 py-1.5 shadow-lg ring-2 ring-white rotate-[6deg]">
        ＋ 3 家對手
      </div>
    </div>
  );
}
