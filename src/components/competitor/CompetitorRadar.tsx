'use client';

import { DIMENSION_LABELS, type StoreScore } from './mock-data';

interface Props {
  you: StoreScore;
  competitors: StoreScore[];
}

const COMPETITOR_COLORS = ['#94a3b8', '#fb923c', '#a78bfa']; // slate-400 / orange-400 / violet-400
const YOU_COLOR = '#1D9E75';

const SIZE = 380;
const CENTER = SIZE / 2;
const RADIUS = 130;
const LABEL_RADIUS = RADIUS + 26;

/** 把 6 維度分數（0-100）轉成 6 個座標點 */
function scoresToPoints(scores: number[]): { x: number; y: number }[] {
  return scores.map((score, idx) => {
    const angle = (Math.PI * 2 * idx) / 6 - Math.PI / 2; // 從上方開始順時針
    const r = (Math.max(0, Math.min(100, score)) / 100) * RADIUS;
    return {
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
    };
  });
}

function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  return points.reduce(
    (acc, p, i) => `${acc}${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)} `,
    '',
  ) + 'Z';
}

/** 同心六邊形（4 層：25/50/75/100）*/
function gridPolygons(): string[] {
  return [0.25, 0.5, 0.75, 1].map((ratio) => {
    const points = Array.from({ length: 6 }, (_, idx) => {
      const angle = (Math.PI * 2 * idx) / 6 - Math.PI / 2;
      const r = ratio * RADIUS;
      return {
        x: CENTER + r * Math.cos(angle),
        y: CENTER + r * Math.sin(angle),
      };
    });
    return pointsToPath(points);
  });
}

function dimensionLabelPositions(): { x: number; y: number; text: string }[] {
  return DIMENSION_LABELS.map((d, idx) => {
    const angle = (Math.PI * 2 * idx) / 6 - Math.PI / 2;
    return {
      x: CENTER + LABEL_RADIUS * Math.cos(angle),
      y: CENTER + LABEL_RADIUS * Math.sin(angle),
      text: d.label,
    };
  });
}

export default function CompetitorRadar({ you, competitors }: Props) {
  const dimKeys = DIMENSION_LABELS.map((d) => d.key);
  const youScores = dimKeys.map((k) => you.dimensions[k]);
  const youPoints = scoresToPoints(youScores);

  const compPaths = competitors.map((c) => {
    const points = scoresToPoints(dimKeys.map((k) => c.dimensions[k]));
    return pointsToPath(points);
  });

  const grids = gridPolygons();
  const labels = dimensionLabelPositions();

  // 軸線（從中心到 100% 每個維度）
  const axisLines = Array.from({ length: 6 }, (_, idx) => {
    const angle = (Math.PI * 2 * idx) / 6 - Math.PI / 2;
    return {
      x2: CENTER + RADIUS * Math.cos(angle),
      y2: CENTER + RADIUS * Math.sin(angle),
    };
  });

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-auto"
        role="img"
        aria-label="六維度雷達比較圖：你 vs 三家同區店"
      >
        {/* 同心六邊形格線 */}
        {grids.map((d, i) => (
          <path
            key={`grid-${i}`}
            d={d}
            fill={i === 3 ? '#f8fafc' : 'none'}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* 軸線 */}
        {axisLines.map((line, i) => (
          <line
            key={`axis-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={line.x2}
            y2={line.y2}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* 對手線（先畫，置底） */}
        {competitors.map((c, idx) => (
          <path
            key={`comp-${idx}`}
            d={compPaths[idx]}
            fill={COMPETITOR_COLORS[idx]}
            fillOpacity="0.1"
            stroke={COMPETITOR_COLORS[idx]}
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
        ))}

        {/* 你的線（最前，主色） */}
        <path
          d={pointsToPath(youPoints)}
          fill={YOU_COLOR}
          fillOpacity="0.18"
          stroke={YOU_COLOR}
          strokeWidth="2.5"
        />
        {/* 你的點 */}
        {youPoints.map((p, i) => (
          <circle
            key={`you-pt-${i}`}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="white"
            stroke={YOU_COLOR}
            strokeWidth="2.5"
          />
        ))}

        {/* 維度文字標籤 */}
        {labels.map((l, i) => (
          <text
            key={`label-${i}`}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-600 font-semibold"
            fontSize="13"
          >
            {l.text}
          </text>
        ))}
      </svg>

      {/* 圖例 */}
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
        <li className="inline-flex items-center gap-2">
          <span
            className="inline-block w-4 h-1.5 rounded-full"
            style={{ background: YOU_COLOR }}
            aria-hidden
          />
          <span className="font-bold text-slate-900">{you.storeName}</span>
          <span className="text-[#1D9E75] font-bold">{you.overall} 分</span>
        </li>
        {competitors.map((c, idx) => (
          <li key={c.storeName} className="inline-flex items-center gap-2">
            <span
              className="inline-block w-4 h-1.5 rounded-full"
              style={{ background: COMPETITOR_COLORS[idx] }}
              aria-hidden
            />
            <span className="text-slate-700">{c.storeName}</span>
            <span className="text-slate-500">{c.overall} 分</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
