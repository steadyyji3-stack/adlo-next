'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ClipboardCheck, Copy, Loader2, RefreshCw, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CustomerGrowthCycle } from '@/lib/customer-growth-types';
import { verificationPlanForTask } from '@/lib/customer-growth-outcomes';

export function GrowthWeek({
  initialCycles,
  storeName,
  autoGenerate = false,
}: {
  initialCycles: CustomerGrowthCycle[];
  storeName: string;
  autoGenerate?: boolean;
}) {
  const [cycles, setCycles] = useState(initialCycles);
  const [instruction, setInstruction] = useState('');
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [beforeValue, setBeforeValue] = useState('');
  const [afterValue, setAfterValue] = useState('');
  const [evidenceCount, setEvidenceCount] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const autoStarted = useRef(false);
  const current = cycles.find((cycle) => isCurrentWeek(cycle.week_start)) ?? null;
  const currentCompleted = current?.status === 'completed';
  const verification = current ? verificationPlanForTask(current.task) : null;

  const generate = useCallback(async (instructionOverride?: string) => {
    setState('working'); setMessage('');
    try {
      const response = await fetch('/api/me/growth-cycle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: (instructionOverride ?? instruction.trim()) || undefined }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error?.message ?? '產生失敗');
      const cycle = data.cycle as CustomerGrowthCycle;
      setCycles((items) => [cycle, ...items.filter((item) => item.id !== cycle.id)]);
      setInstruction(''); setState('idle');
    } catch (error) { setMessage(error instanceof Error ? error.message : '產生失敗'); setState('error'); }
  }, [instruction]);

  useEffect(() => {
    if (!autoGenerate || current || autoStarted.current) return;
    autoStarted.current = true;
    void generate('');
  }, [autoGenerate, current, generate]);

  async function complete() {
    if (!current) return;
    setState('working'); setMessage('');
    try {
      const response = await fetch('/api/me/growth-cycle', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: current.id,
          evidence: {
            confirmed: confirmed || undefined,
            url: evidenceUrl.trim() || undefined,
            beforeValue: metricValue(beforeValue),
            afterValue: metricValue(afterValue),
            count: metricValue(evidenceCount),
            note: completionNote.trim() || undefined,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error?.message ?? '更新失敗');
      setCycles((items) => items.map((item) => item.id === data.cycle.id ? data.cycle : item));
      setCompletionNote('');
      setEvidenceUrl(''); setBeforeValue(''); setAfterValue(''); setEvidenceCount(''); setConfirmed(false);
      setState('idle');
    } catch (error) { setMessage(error instanceof Error ? error.message : '更新失敗'); setState('error'); }
  }

  async function copy(text: string, index: number) {
    try { await navigator.clipboard.writeText(text); setCopied(index); window.setTimeout(() => setCopied(null), 1500); }
    catch { setMessage('無法使用剪貼簿，請手動選取內容'); setState('error'); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <section className="border-b border-slate-200 pb-6">
          <p className="text-xs font-extrabold text-[#0F6E56]">本週唯一任務</p>
          <h1 className="mt-2 max-w-3xl text-2xl font-extrabold text-slate-950 sm:text-3xl">
            {current?.task.title ?? `${storeName}，先完成第一個成長任務`}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            {current?.task.objective ?? '我會根據店家檔案與過去完成紀錄，準備一件本週能落地的事。'}
          </p>
          {current && <div className="mt-4 flex flex-wrap gap-2"><Badge variant="outline">約 {current.task.estimatedMinutes} 分鐘</Badge><Badge variant="outline">{dimensionLabel(current.task.scoreDimension)}</Badge><Badge variant="outline">第 {current.generation_count} 版</Badge></div>}
        </section>

        {!current ? (
          <section className="py-16 text-center"><Target className="mx-auto h-9 w-9 text-[#1D9E75]" /><p className="mt-4 text-sm font-semibold text-slate-600">付款後的第一個成果，現在就能產生。</p><Button onClick={() => generate()} disabled={state === 'working'} className="mt-6 bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">{state === 'working' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{state === 'working' ? '正在準備任務' : '產生本週任務'}</Button></section>
        ) : (
          <div className="divide-y divide-slate-200">
            <section className="py-6"><h2 className="text-sm font-extrabold text-slate-950">為什麼是現在</h2><p className="mt-2 text-sm leading-7 text-slate-600">{current.task.whyNow}</p><ul className="mt-4 space-y-2">{current.evidence.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-500"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D9E75]" />{item}</li>)}</ul></section>
            <section className="py-6"><h2 className="text-sm font-extrabold text-slate-950">照著做</h2><ol className="mt-4 space-y-3">{current.task.steps.map((step, index) => <li key={step} className="grid grid-cols-[28px_1fr] gap-3 text-sm leading-6 text-slate-700"><span className="grid h-7 w-7 place-items-center rounded bg-slate-900 text-xs font-bold text-white">{index + 1}</span>{step}</li>)}</ol></section>
            <section className="py-6"><h2 className="text-sm font-extrabold text-slate-950">已替你準備</h2><div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">{current.task.deliverables.map((item, index) => <article key={`${item.label}-${index}`} className="py-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{item.label}</h3><p className="mt-1 text-xs text-slate-500">{item.usage}</p></div><Button type="button" variant="ghost" size="icon" aria-label={`複製${item.label}`} onClick={() => copy(item.content, index)}>{copied === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.content}</p></article>)}</div></section>
            <section className="py-6">
              <h2 className="text-sm font-extrabold text-slate-950">完成與驗收</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{current.task.successCheck}</p>
              {current.status === 'completed' ? (
                <div className="mt-5 max-w-2xl border-l-4 border-[#1D9E75] pl-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 font-bold text-[#0F6E56]"><ClipboardCheck className="h-5 w-5" />本週已完成</div>
                    {current.outcome_status && <Badge variant="outline">{outcomeLabel(current.outcome_status)}</Badge>}
                    {current.confidence_level && <Badge variant="outline">證據可信度 {confidenceLabel(current.confidence_level)}</Badge>}
                  </div>
                  {current.result_snapshot?.summary && <p className="mt-3 text-sm leading-7 text-slate-700">{current.result_snapshot.summary}</p>}
                  {current.next_recommendation && <p className="mt-3 text-sm leading-7 text-slate-500"><strong className="text-slate-700">下一步：</strong>{current.next_recommendation.rationale}</p>}
                  {current.feedback?.note && <p className="mt-3 text-sm leading-6 text-slate-500">你的補充：{current.feedback.note}</p>}
                </div>
              ) : verification ? (
                <div className="mt-5 max-w-xl space-y-4 border-t border-slate-200 pt-5">
                  <div>
                    <p className="text-sm font-bold text-slate-900">驗收指標：{verification.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{verification.prompt}</p>
                  </div>
                  {verification.method === 'url' && (
                    <div className="space-y-2"><Label htmlFor="growth-evidence-url">公開成果網址</Label><Input id="growth-evidence-url" type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://..." /></div>
                  )}
                  {verification.method === 'before_after' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label htmlFor="growth-before-value">執行前（{verification.unit ?? '數值'}）</Label><Input id="growth-before-value" type="number" min="0" step="any" inputMode="decimal" value={beforeValue} onChange={(event) => setBeforeValue(event.target.value)} /></div>
                      <div className="space-y-2"><Label htmlFor="growth-after-value">目前（{verification.unit ?? '數值'}）</Label><Input id="growth-after-value" type="number" min="0" step="any" inputMode="decimal" value={afterValue} onChange={(event) => setAfterValue(event.target.value)} /></div>
                    </div>
                  )}
                  {verification.method === 'count' && (
                    <div className="space-y-2"><Label htmlFor="growth-evidence-count">實際數量（{verification.unit ?? '次'}）</Label><Input id="growth-evidence-count" type="number" min="1" step="1" inputMode="numeric" value={evidenceCount} onChange={(event) => setEvidenceCount(event.target.value)} /></div>
                  )}
                  {verification.method === 'confirmation' && (
                    <div className="flex items-start gap-3"><Checkbox id="growth-confirmed" checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} /><Label htmlFor="growth-confirmed" className="pt-0.5 leading-5">我已依完成標準執行，且內容符合店家真實狀況</Label></div>
                  )}
                  <div className="space-y-2"><Label htmlFor="growth-result-note">結果補充（選填）</Label><Textarea id="growth-result-note" value={completionNote} onChange={(event) => setCompletionNote(event.target.value)} maxLength={300} placeholder="例如：客人最常回覆哪一句、遇到什麼阻礙" className="min-h-20 resize-none bg-white" /></div>
                  <Button onClick={complete} disabled={state === 'working'} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]"><Check className="mr-2 h-4 w-4" />提交證據並完成</Button>
                </div>
              ) : null}
            </section>
          </div>
        )}
        {message && <p role="alert" className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{message}</p>}
      </div>

      <aside className="lg:border-l lg:border-slate-200 lg:pl-6">
        <h2 className="text-sm font-extrabold text-slate-950">調整本週任務</h2><p className="mt-2 text-xs leading-5 text-slate-500">可指定語氣或角度；每週最多產生 4 版。</p>
        <Textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} maxLength={300} disabled={currentCompleted} placeholder="例如：不要促銷，改成專業教育角度" className="mt-4 min-h-24 resize-none bg-white" />
        <Button type="button" variant="outline" onClick={() => generate()} disabled={state === 'working' || currentCompleted} className="mt-3 w-full font-bold">{state === 'working' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : currentCompleted ? <Check className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}{currentCompleted ? '本週已完成' : current ? '重新產生' : '產生任務'}</Button>
        {current?.feedback?.revisions?.length ? <div className="mt-4 border-l-2 border-slate-200 pl-3"><p className="text-xs font-bold text-slate-600">已記住 {current.feedback.revisions.length} 個舊版本</p><p className="mt-1 text-xs leading-5 text-slate-400">新版本仍會參考先前任務與你的調整。</p></div> : null}
        <div className="mt-8 border-t border-slate-200 pt-6"><h2 className="text-sm font-extrabold text-slate-950">過去任務</h2>{cycles.length === 0 ? <p className="mt-3 text-xs text-slate-500">完成第一週後會開始累積。</p> : <div className="mt-3 space-y-4">{cycles.slice(0, 8).map((cycle) => <div key={cycle.id}><p className="text-xs text-slate-400">{formatWeek(cycle.week_start)}</p><p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{cycle.task.title}</p><p className="mt-1 text-xs text-slate-500">{cycle.outcome_status ? outcomeLabel(cycle.outcome_status) : cycle.status === 'completed' ? '已完成（舊版未驗證紀錄）' : '進行中'}</p>{cycle.result_snapshot?.summary ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{cycle.result_snapshot.summary}</p> : cycle.feedback?.note && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{cycle.feedback.note}</p>}</div>)}</div>}</div>
      </aside>
    </div>
  );
}

function dimensionLabel(value: string) { return ({ profile: '檔案完整度', reviews: '評論', reply: '回覆率', photos: '照片', keywords: '關鍵字', local: '在地相關性', content: '內容更新' } as Record<string, string>)[value] ?? value; }
function formatWeek(value: string) { const date = new Date(`${value}T00:00:00+08:00`); return `${date.getMonth() + 1}/${date.getDate()} 這週`; }
function isCurrentWeek(value: string) { const now = new Date(); const taipei = new Date(now.getTime() + 8 * 60 * 60 * 1000); const offset = (taipei.getUTCDay() + 6) % 7; taipei.setUTCDate(taipei.getUTCDate() - offset); return taipei.toISOString().slice(0, 10) === value; }
function metricValue(value: string) { const normalized = value.trim(); return normalized === '' ? undefined : Number(normalized); }
function outcomeLabel(value: NonNullable<CustomerGrowthCycle['outcome_status']>) { return ({ action_verified: '動作已驗證', verified_improvement: '觀察到改善', verified_no_change: '暫無變化', verified_regression: '需要換方向' } as const)[value]; }
function confidenceLabel(value: NonNullable<CustomerGrowthCycle['confidence_level']>) { return ({ low: '低', medium: '中', high: '高' } as const)[value]; }
