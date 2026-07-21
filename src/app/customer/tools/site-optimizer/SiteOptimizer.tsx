'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  FileCode2,
  LoaderCircle,
  ScanSearch,
  ShieldCheck,
  WandSparkles,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
  SiteCheckStatus,
  SiteIndustryMode,
  SiteOptimizationReport,
} from '@/lib/customer-site-optimizer';

interface SiteOptimizerProps {
  initialUrl: string;
  storeName: string;
  industryMode: SiteIndustryMode;
}

interface ApiResponse {
  ok: boolean;
  report?: SiteOptimizationReport;
  error?: { code: string; message: string };
}

const modeLabels: Record<SiteIndustryMode, string> = {
  restaurant: '餐飲模式',
  clinic: '診所模式',
  retail: '零售模式',
  local_business: '在地店家模式',
};

const statusLabels: Record<SiteCheckStatus, string> = {
  pass: '通過',
  warn: '待改善',
  fail: '優先修正',
};

const statusClasses: Record<SiteCheckStatus, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warn: 'border-amber-200 bg-amber-50 text-amber-700',
  fail: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function SiteOptimizer({ initialUrl, storeName, industryMode }: SiteOptimizerProps) {
  const [report, setReport] = useState<SiteOptimizationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);

  async function runScan() {
    setIsScanning(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch('/api/me/site-optimizer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: initialUrl }),
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok || !data.report) throw new Error(data.error?.message ?? '掃描失敗，請稍後再試');
      setReport(data.report);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : '掃描失敗，請稍後再試');
    } finally {
      setIsScanning(false);
    }
  }

  async function copySchema() {
    if (!report) return;
    await navigator.clipboard.writeText(report.optimizationPack.schemaMarkup);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = `adlo-site-optimizer-${report.hostname}-${report.scannedAt.slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <div className="space-y-9">
      <section className="border-b border-slate-200 pb-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <label htmlFor="site-url" className="text-sm font-extrabold text-slate-900">已登記網站</label>
              <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">{modeLabels[industryMode]}</Badge>
            </div>
            <Input id="site-url" value={initialUrl} readOnly className="h-12 border-slate-300 bg-white font-medium text-slate-700" />
            <p className="mt-2 text-xs leading-5 text-slate-500">為保護服務與他人網站，只掃描 onboarding 已登記的公開網域。</p>
          </div>
          <Button onClick={runScan} disabled={isScanning} size="lg" className="h-12 bg-[#0F6E56] px-6 font-extrabold text-white hover:bg-[#0B5946]">
            {isScanning ? <LoaderCircle className="animate-spin" aria-hidden /> : <WandSparkles aria-hidden />}
            {isScanning ? '正在檢查網站' : report ? '重新產生優化包' : '產生全站優化包'}
          </Button>
        </div>

        {error && (
          <div role="alert" className="mt-5 flex items-start gap-3 border-y border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}
      </section>

      {!report && !isScanning && (
        <section className="grid gap-6 border-b border-slate-200 pb-9 md:grid-cols-3">
          <EmptyFeature icon={ScanSearch} title="代表頁檢查" body="從 sitemap 選取最多 8 頁，檢查標題、摘要、H1、索引、圖片與內部連結。" />
          <EmptyFeature icon={FileCode2} title="產業修正包" body={`依 ${storeName} 的產業，整理頁面標題、內容區塊、FAQ 與結構化資料。`} />
          <EmptyFeature icon={ShieldCheck} title="不改網站" body="只讀取公開頁面並產生建議，不登入 CMS、不自動發布，也不索取 Google 權限。" />
        </section>
      )}

      {isScanning && (
        <section aria-live="polite" className="border-b border-slate-200 py-12 text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#0F6E56]" aria-hidden />
          <p className="mt-4 font-extrabold text-slate-900">正在整理 {storeName} 的網站訊號</p>
          <p className="mt-1 text-sm text-slate-500">依網站回應速度，通常需要數秒到一分鐘。</p>
        </section>
      )}

      {report && (
        <>
          <ReportSummary report={report} onDownload={downloadReport} />
          <PriorityFixes report={report} />
          <PageAudits report={report} />
          <ContentPack report={report} onCopySchema={copySchema} copied={copied} />
          <Limitations report={report} />
        </>
      )}
    </div>
  );
}

function EmptyFeature({ icon: Icon, title, body }: { icon: typeof ScanSearch; title: string; body: string }) {
  return (
    <div className="min-w-0">
      <Icon className="h-5 w-5 text-[#0F6E56]" aria-hidden />
      <h2 className="mt-3 text-sm font-extrabold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function ReportSummary({ report, onDownload }: { report: SiteOptimizationReport; onDownload: () => void }) {
  const failed = report.pages.flatMap((page) => page.checks).filter((check) => check.status === 'fail').length;
  const warning = report.pages.flatMap((page) => page.checks).filter((check) => check.status === 'warn').length;
  return (
    <section className="border-b border-slate-200 pb-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">本次結果</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">網站基礎分數 {report.overallScore}</h2>
          <p className="mt-1 text-sm text-slate-500">{report.pages.length} 個代表頁面 · {report.coverage === 'sitemap' ? 'Sitemap 掃描' : '首頁掃描'}</p>
        </div>
        <Button variant="outline" onClick={onDownload} className="border-slate-300 bg-white font-bold">
          <Download aria-hidden />下載 JSON
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-3 border-y border-slate-200 bg-white">
        <Metric value={String(report.overallScore)} label="平均分數" tone="text-[#0F6E56]" />
        <Metric value={String(failed)} label="優先修正" tone="text-rose-700" />
        <Metric value={String(warning)} label="待改善" tone="text-amber-700" />
      </div>
    </section>
  );
}

function Metric({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className="min-w-0 border-r border-slate-200 px-3 py-5 text-center last:border-r-0 sm:px-6">
      <p className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${tone}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">{label}</p>
    </div>
  );
}

function PriorityFixes({ report }: { report: SiteOptimizationReport }) {
  return (
    <section className="border-b border-slate-200 pb-9">
      <SectionHeading eyebrow="先做這些" title="優先修正清單" />
      <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200 bg-white">
        {report.priorityFixes.map((fix, index) => (
          <div key={fix.id} className="grid gap-3 px-4 py-5 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:px-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-extrabold text-white">{index + 1}</span>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900">{fix.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{fix.action}</p>
              <p className="mt-2 break-words text-xs text-slate-400">影響：{fix.affectedPages.join('、')}</p>
            </div>
            <Badge variant="outline" className={`h-fit w-fit ${fix.impact === 'high' ? statusClasses.fail : statusClasses.warn}`}>
              {fix.impact === 'high' ? '高影響' : '中影響'}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}

function PageAudits({ report }: { report: SiteOptimizationReport }) {
  return (
    <section className="border-b border-slate-200 pb-9">
      <SectionHeading eyebrow="頁面證據" title="代表頁檢查" />
      <div className="mt-5 space-y-4">
        {report.pages.map((page) => (
          <details key={page.url} className="rounded-lg border border-slate-200 bg-white open:border-slate-300">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="truncate font-extrabold text-slate-900">{page.title}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{page.path}</p>
              </div>
              <span className={`shrink-0 text-xl font-extrabold tabular-nums ${scoreTone(page.score)}`}>{page.score}</span>
            </summary>
            <div className="border-t border-slate-200 px-4 py-2 sm:px-5">
              {page.checks.map((check) => (
                <div key={check.id} className="grid gap-2 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[160px_100px_minmax(0,1fr)] sm:items-start">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <StatusIcon status={check.status} />{check.label}
                  </div>
                  <Badge variant="outline" className={`w-fit ${statusClasses[check.status]}`}>{statusLabels[check.status]}</Badge>
                  <div className="text-sm leading-6 text-slate-600">
                    <p className="font-semibold text-slate-800">{check.found}</p>
                    {check.status !== 'pass' && <p>{check.fix}</p>}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContentPack({ report, onCopySchema, copied }: { report: SiteOptimizationReport; onCopySchema: () => void; copied: boolean }) {
  const pack = report.optimizationPack;
  return (
    <section className="border-b border-slate-200 pb-9">
      <SectionHeading eyebrow={modeLabels[report.industryMode]} title="可執行優化包" />

      {pack.requiresHumanReview && (
        <div className="mt-5 flex items-start gap-3 border-y border-amber-300 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div><p className="font-extrabold">診所內容需人工法規複核</p><p>{pack.complianceNote}</p></div>
        </div>
      )}

      <div className="mt-7">
        <h3 className="text-lg font-extrabold text-slate-950">頁面文案骨架</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {pack.pageBlueprints.map((blueprint) => (
            <article key={blueprint.page} className="rounded-lg border border-slate-200 bg-white p-5">
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">{blueprint.page}</Badge>
              <dl className="mt-4 space-y-4 text-sm">
                <CopyField label="Title" value={blueprint.title} />
                <CopyField label="Meta description" value={blueprint.metaDescription} />
                <CopyField label="H1" value={blueprint.h1} />
              </dl>
              <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                {blueprint.sections.map((section) => <li key={section} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F6E56]" aria-hidden />{section}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-9 grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold text-slate-950">店家 JSON-LD</h3>
            <Button variant="outline" size="sm" onClick={onCopySchema} className="border-slate-300 bg-white font-bold">
              {copied ? <Check aria-hidden /> : <Clipboard aria-hidden />}{copied ? '已複製' : '複製程式碼'}
            </Button>
          </div>
          <pre className="mt-4 max-h-[460px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-emerald-100"><code>{pack.schemaMarkup}</code></pre>
          {pack.missingBusinessFields.length > 0 && (
            <div className="mt-3 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-extrabold">發布前待補：</span>{pack.missingBusinessFields.join('、')}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-950">常見問題草稿</h3>
          <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 bg-white px-4">
            {pack.faqDrafts.map((faq) => (
              <div key={faq.question} className="py-4">
                <p className="font-extrabold text-slate-900">{faq.question}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-7 text-lg font-extrabold text-slate-950">上線順序</h3>
          <ol className="mt-4 space-y-3">
            {pack.implementationChecklist.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E5F5EF] text-xs font-extrabold text-[#0F6E56]">{index + 1}</span>{item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{label}</dt>
      <dd className="mt-1 break-words font-semibold leading-6 text-slate-800">{value}</dd>
    </div>
  );
}

function Limitations({ report }: { report: SiteOptimizationReport }) {
  return (
    <section className="pb-4">
      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><ShieldCheck className="h-5 w-5 text-[#0F6E56]" aria-hidden />報告邊界</div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
        {report.limitations.map((item) => <li key={item}>• {item}</li>)}
      </ul>
      <a href={report.targetUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0F6E56] hover:underline">
        開啟掃描網站<ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div><p className="text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">{eyebrow}</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950">{title}</h2></div>
  );
}

function StatusIcon({ status }: { status: SiteCheckStatus }) {
  if (status === 'pass') return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />;
  if (status === 'warn') return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />;
  return <XCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden />;
}

function scoreTone(score: number) {
  if (score >= 80) return 'text-emerald-700';
  if (score >= 60) return 'text-amber-700';
  return 'text-rose-700';
}
