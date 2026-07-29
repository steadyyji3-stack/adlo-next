import {
  AlertTriangle,
  CheckCircle2,
  History,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type {
  SiteOptimizerCheckChange,
  SiteOptimizerComparison,
  SiteOptimizerHistoryEntry,
  SiteOptimizerPageChange,
} from '@/lib/customer-site-optimizer-comparison';

interface SiteOptimizerHistoryProps {
  history: SiteOptimizerHistoryEntry[];
  comparison: SiteOptimizerComparison | null;
  available: boolean;
}

export function SiteOptimizerHistory({ history, comparison, available }: SiteOptimizerHistoryProps) {
  if (!available) {
    return (
      <section className="border-y border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-900 sm:px-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div><p className="font-extrabold">歷史比較暫時無法讀取</p><p className="mt-1 leading-6">掃描資料服務尚未就緒，請稍後重新整理。</p></div>
        </div>
      </section>
    );
  }

  if (history.length === 0) {
    return (
      <section className="border-y border-slate-200 py-6">
        <div className="flex items-start gap-3">
          <History className="mt-0.5 h-5 w-5 shrink-0 text-[#0F6E56]" aria-hidden />
          <div>
            <h2 className="font-extrabold text-slate-900">第一次掃描會建立改善基準</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">完成修正後再次掃描，系統會指出已修正、改善中、惡化與新增待改善觀察。</p>
          </div>
        </div>
      </section>
    );
  }

  const latest = history[0];
  const chronological = [...history].reverse();

  return (
    <section className="border-b border-slate-200 pb-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">持續改善紀錄</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">優化前後比較</h2>
          <p className="mt-1 text-sm text-slate-500">最近 {history.length} 次掃描 · 最新 {formatDate(latest.scannedAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400">最新分數</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-[#0F6E56]">{latest.overallScore}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border-y border-slate-200 bg-white px-4 py-5">
        <div
          className="flex h-36 items-end gap-3"
          style={{ minWidth: `${Math.max(320, chronological.length * 64)}px` }}
          aria-label="網站優化分數歷史"
        >
          {chronological.map((entry) => (
            <div key={entry.id} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-extrabold tabular-nums text-slate-700">{entry.overallScore}</span>
              <div className="flex h-20 w-full items-end justify-center border-b border-slate-200">
                <div
                  className="w-full max-w-10 rounded-t bg-[#1D9E75]"
                  style={{ height: `${Math.max(8, entry.overallScore)}%` }}
                  title={`${formatDate(entry.scannedAt)}：${entry.overallScore} 分`}
                />
              </div>
              <span className="whitespace-nowrap text-[11px] font-semibold text-slate-400">{formatShortDate(entry.scannedAt)}</span>
            </div>
          ))}
        </div>
      </div>

      {comparison ? <ComparisonDetails comparison={comparison} /> : <Baseline latest={latest} />}
    </section>
  );
}

function Baseline({ latest }: { latest: SiteOptimizerHistoryEntry }) {
  return (
    <div className="mt-5 flex items-start gap-3 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div><p className="font-extrabold">改善基準已建立：{latest.overallScore} 分</p><p className="mt-1 leading-6">完成優先修正後重新產生優化包，就能看到具體變化。</p></div>
    </div>
  );
}

function ComparisonDetails({ comparison }: { comparison: SiteOptimizerComparison }) {
  const delta = comparison.scoreDelta;
  return (
    <div className="mt-7">
      <div className="grid grid-cols-2 border-y border-slate-200 bg-white lg:grid-cols-4">
        <ComparisonMetric
          icon={delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus}
          value={signed(delta)}
          label={`分數變化（${comparison.previousScore} → ${comparison.currentScore}）`}
          tone={delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-rose-700' : 'text-slate-600'}
        />
        <ComparisonMetric icon={CheckCircle2} value={String(comparison.resolved.length)} label="已修正" tone="text-emerald-700" />
        <ComparisonMetric icon={TrendingUp} value={String(comparison.improved.length)} label="改善中" tone="text-sky-700" />
        <ComparisonMetric icon={TrendingDown} value={String(comparison.regressed.length)} label="惡化" tone="text-rose-700" />
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        本次 {comparison.currentPages} 頁、上次 {comparison.previousPages} 頁；其中 {comparison.commonPages} 頁可直接比較。未再次掃到的頁面不會被誤判為已修正。
      </p>

      <PageChanges items={comparison.pageChanges} />

      <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
        <ChangeGroup title="已修正" body="上次待改善，本次已通過" items={comparison.resolved} tone="emerald" />
        <ChangeGroup title="改善中" body="問題程度下降，但仍需完成" items={comparison.improved} tone="sky" />
        <ChangeGroup title="惡化" body="相同頁面的檢查狀態下降" items={comparison.regressed} tone="rose" />
        <ChangeGroup title="新增待改善觀察" body="新頁面或新出現的檢查項目" items={comparison.newIssues} tone="amber" />
      </div>
    </div>
  );
}

function PageChanges({ items }: { items: SiteOptimizerPageChange[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 border-y border-slate-200 bg-white px-4 py-5">
      <h3 className="font-extrabold text-slate-900">可比較頁面分數</h3>
      <div className="mt-4 divide-y divide-slate-100">
        {items.slice(0, 6).map((item) => (
          <div key={item.path} className="flex min-w-0 items-center justify-between gap-4 py-3 text-sm">
            <span className="min-w-0 truncate font-semibold text-slate-700" title={item.path}>{item.path}</span>
            <span className="shrink-0 font-bold tabular-nums text-slate-500">
              {item.beforeScore} → {item.afterScore}
              <span className={`ml-2 ${item.delta > 0 ? 'text-emerald-700' : item.delta < 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                {signed(item.delta)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonMetric({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof TrendingUp;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="min-w-0 border-b border-r border-slate-200 px-4 py-5 last:border-r-0 lg:border-b-0">
      <Icon className={`h-4 w-4 ${tone}`} aria-hidden />
      <p className={`mt-3 text-2xl font-extrabold tabular-nums ${tone}`}>{value}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{label}</p>
    </div>
  );
}

function ChangeGroup({
  title,
  body,
  items,
  tone,
}: {
  title: string;
  body: string;
  items: SiteOptimizerCheckChange[];
  tone: 'emerald' | 'sky' | 'rose' | 'amber';
}) {
  const toneClass = {
    emerald: 'text-emerald-700',
    sky: 'text-sky-700',
    rose: 'text-rose-700',
    amber: 'text-amber-700',
  }[tone];

  return (
    <div className="grid gap-3 py-5 sm:grid-cols-[180px_minmax(0,1fr)]">
      <div><h3 className={`font-extrabold ${toneClass}`}>{title} · {items.length}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{body}</p></div>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm text-slate-700">
          {items.slice(0, 6).map((item) => (
            <li key={`${item.path}:${item.checkId}`} className="flex min-w-0 items-start justify-between gap-3">
              <span className="min-w-0 break-words font-semibold">{item.label}</span>
              <span className="max-w-[45%] shrink-0 truncate text-xs text-slate-400" title={item.path}>{item.path}</span>
            </li>
          ))}
          {items.length > 6 && <li className="text-xs font-bold text-slate-400">另有 {items.length - 6} 項</li>}
        </ul>
      ) : <p className="text-sm text-slate-400">本次沒有此類變化</p>}
    </div>
  );
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' }).format(new Date(value));
}
