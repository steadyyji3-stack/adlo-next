'use client';

import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Check,
  Clipboard,
  Download,
  FlaskConical,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
  PurchaseDistribution,
  SyntheticConsumer,
  SyntheticConsumerReport,
} from '@/lib/customer-synthetic-consumer';

interface ApiResponse {
  ok: boolean;
  report?: SyntheticConsumerReport;
  quota?: { count: number; limit: number; resetAt: number };
  error?: { code: string; message: string };
}

const initialForm = {
  productConcept: '',
  targetAudience: '',
  testFocus: '',
};

const scoreLabels: Record<keyof PurchaseDistribution, string> = {
  1: '完全不會買',
  2: '不太可能買',
  3: '再觀望',
  4: '蠻想買的',
  5: '幾乎確定會買',
};

export function SyntheticConsumerWorkspace() {
  const [form, setForm] = useState(initialForm);
  const [report, setReport] = useState<SyntheticConsumerReport | null>(null);
  const [quota, setQuota] = useState<{ count: number; limit: number } | null>(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsGenerating(true);
    try {
      const response = await fetch('/api/me/synthetic-consumer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok || !data.report) throw new Error(data.error?.message ?? '分析產生失敗，請稍後再試');
      setReport(data.report);
      setQuota(data.quota ? { count: data.quota.count, limit: data.quota.limit } : null);
      window.setTimeout(() => document.getElementById('analysis-report')?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : '分析產生失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyReport() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(buildMarkdownReport(report));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadReport() {
    if (!report) return;
    const contents = buildMarkdownReport(report);
    const blob = new Blob([contents], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `adlo-合成消費者分析-${report.generatedAt.slice(0, 10)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function startNewAnalysis() {
    setReport(null);
    setCopied(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (report) {
    return (
      <ReportView
        report={report}
        quota={quota}
        copied={copied}
        onCopy={copyReport}
        onDownload={downloadReport}
        onReset={startNewAnalysis}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-slate-200 pb-8 md:grid-cols-3">
        <MethodStep number="01" title="先聽想法" body="五位合成消費者先完成自然語言回應，此階段禁止任何分數。" />
        <MethodStep number="02" title="再轉機率" body="第二階段只讀既有回應，轉換為 1–5 分的機率分布。" />
        <MethodStep number="03" title="交付報告" body="整理吸引點、阻礙、價格接受度與具體優化方向。" />
      </section>

      <div className="border-y border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <div className="text-sm leading-6 text-amber-900">
            <p className="font-extrabold">合成分析，不是真人調查</p>
            <p>內容會傳送至 AI provider 處理，adlo 不保存本次輸入或報告。請勿輸入個資、商業機密或未公開資料；重要決策仍需用真人訪談與市場測試驗證。</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-7">
        <FormField
          id="product-concept"
          label="1. 產品概念描述"
          helper="包含名稱、主要功能、售價、使用情境、特色與目前替代方案。"
          value={form.productConcept}
          minLength={50}
          maxLength={4000}
          placeholder={'產品名稱：\n主要功能／訴求：\n建議售價：\n使用情境：\n其他特色：'}
          onChange={(value) => setForm((current) => ({ ...current, productConcept: value }))}
        />
        <FormField
          id="target-audience"
          label="2. 目標客群"
          helper="描述年齡、地區、收入感受、家庭狀況、消費習慣與選購方式。"
          value={form.targetAudience}
          minLength={30}
          maxLength={2500}
          placeholder={'年齡：\n性別：\n居住地：\n收入／家庭狀況：\n消費習慣：'}
          onChange={(value) => setForm((current) => ({ ...current, targetAudience: value }))}
        />
        <FormField
          id="test-focus"
          label="3. 想特別測試的重點（選填）"
          helper="例如價格敏感度、包裝、信任感、使用門檻或與競品比較。"
          value={form.testFocus}
          maxLength={1000}
          placeholder="這次最想確認哪個假設？"
          compact
          onChange={(value) => setForm((current) => ({ ...current, testFocus: value }))}
        />

        {error && (
          <div role="alert" className="border-y border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <p className="text-xs leading-5 text-slate-500">每日 3 份完整分析。產生期間請保持此頁開啟。</p>
          <Button
            type="submit"
            size="lg"
            disabled={isGenerating || form.productConcept.trim().length < 50 || form.targetAudience.trim().length < 30}
            className="h-12 bg-[#0F6E56] px-6 font-extrabold text-white hover:bg-[#0B5946]"
          >
            {isGenerating ? <LoaderCircle className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />}
            {isGenerating ? '正在完成兩階段分析' : '產生購買意願報告'}
          </Button>
        </div>
      </form>

      {isGenerating && (
        <section aria-live="polite" className="border-y border-emerald-200 bg-emerald-50 px-5 py-8 text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#0F6E56]" aria-hidden />
          <p className="mt-4 font-extrabold text-slate-900">先讓五位消費者把話說完，再進行機率轉換</p>
          <p className="mt-1 text-sm text-slate-600">完整報告通常需要 20–50 秒。</p>
        </section>
      )}
    </div>
  );
}

function MethodStep({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="min-w-0">
      <span className="text-xs font-extrabold text-[#0F6E56]">{number}</span>
      <h2 className="mt-2 text-base font-extrabold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function FormField({
  id,
  label,
  helper,
  value,
  minLength,
  maxLength,
  placeholder,
  compact = false,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  minLength?: number;
  maxLength: number;
  placeholder: string;
  compact?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <Label htmlFor={id} className="text-base font-extrabold text-slate-950">{label}</Label>
          <p id={`${id}-helper`} className="mt-1 text-sm leading-6 text-slate-500">{helper}</p>
        </div>
        <span className="text-xs tabular-nums text-slate-400">{value.length}/{maxLength}</span>
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minLength={minLength}
        maxLength={maxLength}
        required={Boolean(minLength)}
        placeholder={placeholder}
        aria-describedby={`${id}-helper`}
        className={`${compact ? 'min-h-28' : 'min-h-44'} resize-y border-slate-300 bg-white px-4 py-3 leading-6`}
      />
    </div>
  );
}

function ReportView({
  report,
  quota,
  copied,
  onCopy,
  onDownload,
  onReset,
}: {
  report: SyntheticConsumerReport;
  quota: { count: number; limit: number } | null;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onReset: () => void;
}) {
  return (
    <article id="analysis-report" className="space-y-10">
      <section className="border-b border-slate-200 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">adlo report</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">合成消費者購買意願分析報告</h2>
            <p className="mt-2 text-sm text-slate-500">{new Date(report.generatedAt).toLocaleString('zh-TW')} · 五位合成消費者</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onCopy} className="border-slate-300 bg-white font-bold">
              {copied ? <Check aria-hidden /> : <Clipboard aria-hidden />}{copied ? '已複製' : '複製報告'}
            </Button>
            <Button onClick={onDownload} className="bg-[#0F6E56] font-bold text-white hover:bg-[#0B5946]">
              <Download aria-hidden />下載 Markdown
            </Button>
          </div>
        </div>
        {quota && <p className="mt-4 text-xs text-slate-400">今日已使用 {quota.count}/{quota.limit} 份</p>}
      </section>

      <section>
        <SectionHeading icon={BarChart3} eyebrow="1. 分析摘要" title="整體購買意願" />
        <div className="mt-5 grid grid-cols-3 border-y border-slate-200 bg-white">
          <Metric value={report.summary.overallAverage.toFixed(2)} label="平均 / 5" tone="text-[#0F6E56]" />
          <Metric value={`${report.summary.highIntentPercent}%`} label="高意願 4–5 分" tone="text-emerald-700" />
          <Metric value={`${report.summary.lowIntentPercent}%`} label="低意願 1–2 分" tone="text-rose-700" />
        </div>
        <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200 bg-white px-4 sm:px-5">
          {report.summary.coreFindings.map((finding) => (
            <li key={finding} className="flex gap-3 py-4 text-sm leading-6 text-slate-700">
              <Check className="mt-1 h-4 w-4 shrink-0 text-[#0F6E56]" aria-hidden />{finding}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-slate-200 pt-9">
        <SectionHeading icon={UsersRound} eyebrow="2. 消費者詳細回應" title="五種真實感受與購買條件" />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">每位消費者先完成四段自然回應，下方才顯示第二階段的機率分布。</p>
        <div className="mt-6 space-y-5">
          {report.consumers.map((consumer) => <ConsumerResult key={consumer.id} consumer={consumer} />)}
        </div>
      </section>

      <section className="border-t border-slate-200 pt-9">
        <SectionHeading icon={FlaskConical} eyebrow="3. 關鍵洞察與建議" title="下一輪產品驗證重點" />
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <InsightList title="最吸引消費者的點" items={report.insights.strongestAppeals} />
          <InsightList title="最大疑慮／購買阻礙" items={report.insights.biggestBarriers} />
        </div>
        <div className="mt-8 border-y border-slate-200 bg-white px-4 py-5 sm:px-5">
          <h3 className="font-extrabold text-slate-950">價格接受度觀察</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700">{report.insights.priceAcceptance}</p>
        </div>
        <div className="mt-8">
          <h3 className="font-extrabold text-slate-950">建議優化方向</h3>
          <ol className="mt-4 divide-y divide-slate-200 border-y border-slate-200 bg-white px-4 sm:px-5">
            {report.insights.recommendations.map((recommendation, index) => (
              <li key={recommendation} className="grid gap-3 py-4 text-sm leading-6 text-slate-700 sm:grid-cols-[32px_minmax(0,1fr)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E5F5EF] text-xs font-extrabold text-[#0F6E56]">{index + 1}</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-9">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">4. 不同客群差異</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{report.insights.segmentDifferences}</p>
      </section>

      <section className="border-y border-slate-300 bg-slate-950 px-5 py-7 text-white sm:px-7">
        <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">5. 結論</p>
        <p className="mt-3 text-base font-semibold leading-8 text-slate-100">{report.insights.conclusion}</p>
      </section>

      <section className="border-y border-amber-200 bg-amber-50 px-4 py-5 sm:px-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <div>
            <h3 className="font-extrabold text-amber-950">免責聲明</h3>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-900">
              {report.disclaimer.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <p className="max-w-3xl text-xs leading-5 text-slate-500">方法：{report.methodology}</p>
        <Button variant="outline" onClick={onReset} className="border-slate-300 bg-white font-bold">
          <RotateCcw aria-hidden />建立新分析
        </Button>
      </div>
    </article>
  );
}

function ConsumerResult({ consumer }: { consumer: SyntheticConsumer }) {
  const distributionText = ([1, 2, 3, 4, 5] as const)
    .map((score) => `${score}分 ${consumer.distribution[score]}%`)
    .join('｜');
  return (
    <details className="rounded-lg border border-slate-200 bg-white open:border-slate-300" open={consumer.id === 'A'}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">消費者 {consumer.id}</Badge>
            <h3 className="font-extrabold text-slate-950">{consumer.alias}</h3>
          </div>
          <p className="mt-2 truncate text-xs text-slate-500">{consumer.profile.age} 歲 · {consumer.profile.gender} · {consumer.profile.occupation}</p>
        </div>
        <span className="shrink-0 text-xl font-extrabold tabular-nums text-[#0F6E56]">{consumer.averageScore.toFixed(2)}</span>
      </summary>
      <div className="border-t border-slate-200 px-4 py-5 sm:px-5">
        <div className="grid gap-4 border-b border-slate-100 pb-5 text-sm md:grid-cols-2">
          <ProfileItem label="家庭狀況" value={consumer.profile.family} />
          <ProfileItem label="收入感受" value={consumer.profile.incomeFeeling} />
          <ProfileItem label="消費習慣與個性" value={consumer.habitsAndPersonality} />
          <ProfileItem label="既有態度" value={consumer.existingAttitude} />
        </div>

        <div className="divide-y divide-slate-100">
          <ResponseItem question="第一眼看到這個產品的感覺" answer={consumer.response.firstImpression} />
          <ResponseItem question="覺得值不值得買？為什麼？" answer={consumer.response.valueJudgment} />
          <ResponseItem question="跟現在使用的產品相比" answer={consumer.response.currentAlternativeComparison} />
          <ResponseItem question="什麼情況會買，什麼情況絕對不買" answer={consumer.response.purchaseAndRejectionConditions} />
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h4 className="text-sm font-extrabold text-slate-950">自然語言轉換結果</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{consumer.mappingRationale}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {([1, 2, 3, 4, 5] as const).map((score) => (
              <div key={score} className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-700">{score} 分</span>
                  <span className="tabular-nums text-slate-500">{consumer.distribution[score]}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
                  <div className="h-full bg-[#1D9E75]" style={{ width: `${consumer.distribution[score]}%` }} />
                </div>
                <p className="mt-1 truncate text-[11px] text-slate-400" title={scoreLabels[score]}>{scoreLabels[score]}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 break-words text-sm font-extrabold text-slate-900">消費者 {consumer.id}：{distributionText}｜平均 {consumer.averageScore.toFixed(2)}</p>
        </div>
      </div>
    </details>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{label}</p><p className="mt-1 leading-6 text-slate-700">{value}</p></div>;
}

function ResponseItem({ question, answer }: { question: string; answer: string }) {
  return <div className="py-5"><h4 className="text-sm font-extrabold text-slate-950">{question}</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{answer}</p></div>;
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div><h3 className="font-extrabold text-slate-950">{title}</h3><ul className="mt-3 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><Check className="mt-1 h-4 w-4 shrink-0 text-[#0F6E56]" aria-hidden />{item}</li>)}</ul></div>
  );
}

function SectionHeading({ icon: Icon, eyebrow, title }: { icon: typeof BarChart3; eyebrow: string; title: string }) {
  return <div><div className="flex items-center gap-2 text-[#0F6E56]"><Icon className="h-5 w-5" aria-hidden /><p className="text-xs font-extrabold uppercase tracking-widest">{eyebrow}</p></div><h2 className="mt-2 text-2xl font-extrabold text-slate-950">{title}</h2></div>;
}

function Metric({ value, label, tone }: { value: string; label: string; tone: string }) {
  return <div className="min-w-0 border-r border-slate-200 px-2 py-5 text-center last:border-r-0 sm:px-5"><p className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${tone}`}>{value}</p><p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">{label}</p></div>;
}

function buildMarkdownReport(report: SyntheticConsumerReport) {
  const lines = [
    '# adlo 合成消費者購買意願分析報告',
    '',
    `產生時間：${new Date(report.generatedAt).toLocaleString('zh-TW')}`,
    '',
    '## 1. 分析摘要',
    '',
    `- 整體平均購買意願分數：${report.summary.overallAverage.toFixed(2)} / 5`,
    `- 高意願（4-5分）比例：${report.summary.highIntentPercent}%`,
    `- 低意願（1-2分）比例：${report.summary.lowIntentPercent}%`,
    ...report.summary.coreFindings.map((finding) => `- ${finding}`),
    '',
    '## 2. 五位合成消費者詳細回應',
    '',
    ...report.consumers.flatMap((consumer) => consumerMarkdown(consumer)),
    '## 3. 關鍵洞察與建議',
    '',
    '### 最吸引消費者的點',
    ...report.insights.strongestAppeals.map((item) => `- ${item}`),
    '',
    '### 最大疑慮／阻礙購買的點',
    ...report.insights.biggestBarriers.map((item) => `- ${item}`),
    '',
    '### 價格接受度觀察',
    report.insights.priceAcceptance,
    '',
    '### 建議優化方向',
    ...report.insights.recommendations.map((item, index) => `${index + 1}. ${item}`),
    '',
    '## 4. 不同客群差異觀察',
    '',
    report.insights.segmentDifferences,
    '',
    '## 5. 結論',
    '',
    report.insights.conclusion,
    '',
    '## 免責聲明',
    '',
    ...report.disclaimer.map((item) => `- ${item}`),
    '',
    `方法：${report.methodology}`,
  ];
  return lines.join('\n');
}

function consumerMarkdown(consumer: SyntheticConsumer) {
  const distribution = ([1, 2, 3, 4, 5] as const).map((score) => `${score}分 ${consumer.distribution[score]}%`).join('｜');
  return [
    `### 消費者 ${consumer.id}：${consumer.alias}`,
    '',
    `- 基本資料：${consumer.profile.age} 歲／${consumer.profile.gender}／${consumer.profile.occupation}／${consumer.profile.family}`,
    `- 收入感受：${consumer.profile.incomeFeeling}`,
    `- 消費習慣與個性：${consumer.habitsAndPersonality}`,
    `- 對此類產品的既有態度：${consumer.existingAttitude}`,
    '',
    '**第一眼感覺**',
    '',
    consumer.response.firstImpression,
    '',
    '**值不值得買**',
    '',
    consumer.response.valueJudgment,
    '',
    '**與目前替代方案比較**',
    '',
    consumer.response.currentAlternativeComparison,
    '',
    '**會買與絕對不買的條件**',
    '',
    consumer.response.purchaseAndRejectionConditions,
    '',
    `機率轉換理由：${consumer.mappingRationale}`,
    '',
    `消費者 ${consumer.id}：${distribution}｜平均 ${consumer.averageScore.toFixed(2)}`,
    '',
  ];
}
