'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ClipboardCheck, Copy, Flame, Loader2, RefreshCw, Target, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CustomerGrowthCycle } from '@/lib/customer-growth-types';
import { verificationPlanForTask } from '@/lib/customer-growth-outcomes';
import { buildCustomerGrowthProgress } from '@/lib/customer-growth-progress';

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
  const [guideStep, setGuideStep] = useState(1);
  const autoStarted = useRef(false);
  const current = cycles.find((cycle) => isCurrentWeek(cycle.week_start)) ?? null;
  const currentCompleted = current?.status === 'completed';
  const verification = current ? verificationPlanForTask(current.task) : null;
  const progress = buildCustomerGrowthProgress(cycles);
  const pastCycles = cycles.filter((cycle) => cycle.id !== current?.id);
  const visibleGuideStep = currentCompleted ? 4 : guideStep;

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
      setGuideStep(1);
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
      setGuideStep(4);
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
        {progress.completedWeeks > 0 && <section className="mb-8 border-y border-slate-200 py-5" aria-labelledby="growth-progress-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold text-[#0F6E56]">累積成效帳本</p>
              <h2 id="growth-progress-title" className="mt-1 text-lg font-extrabold text-slate-950">
                {progress.stageLabel}
              </h2>
            </div>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              驗證進度 {verificationStageNumber(progress.stage)} / 4
            </Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 border-y border-slate-200 sm:grid-cols-4">
            <ProgressMetric label="完成週數" value={progress.completedWeeks} />
            <ProgressMetric label="有證據週數" value={progress.verifiedWeeks} />
            <ProgressMetric label="觀察改善" value={progress.improvementWeeks} />
            <ProgressMetric label="連續完成" value={progress.completionStreak} icon={Flame} />
          </div>
          <div className="mt-4 flex items-start gap-3 text-sm leading-6 text-slate-600">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[#1D9E75]" aria-hidden />
            <p><strong className="text-slate-800">下一個驗收里程碑：</strong>{progress.nextMilestone}</p>
          </div>
          {progress.latestRecommendation && (
            <p className="mt-2 pl-7 text-xs leading-5 text-slate-500">
              系統目前策略：{strategyLabel(progress.latestRecommendation.strategy)}。{progress.latestRecommendation.rationale}
            </p>
          )}
        </section>}
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
          <div>
            <TaskGuideSteps currentStep={visibleGuideStep} />

            {visibleGuideStep === 1 && (
              <section className="py-8" aria-labelledby="task-understand-title">
                <p className="text-xs font-extrabold text-[#0F6E56]">第 1 步</p>
                <h2 id="task-understand-title" className="mt-2 text-xl font-extrabold text-slate-950">先看懂今天要做什麼</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{current.task.whyNow}</p>
                <ul className="mt-5 max-w-2xl space-y-2">{current.evidence.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-500"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D9E75]" />{item}</li>)}</ul>
                <details className="mt-6 max-w-2xl border-y border-slate-200 py-4"><summary className="cursor-pointer text-sm font-bold text-slate-700">這是在改善什麼？</summary><p className="mt-2 text-sm leading-6 text-slate-500">{dimensionHelp(current.task.scoreDimension)}</p></details>
                <Button type="button" onClick={() => setGuideStep(2)} className="mt-6 bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">開始照著做<ChevronRight className="h-4 w-4" aria-hidden /></Button>
              </section>
            )}

            {visibleGuideStep === 2 && (
              <section className="py-8" aria-labelledby="task-action-title">
                <p className="text-xs font-extrabold text-[#0F6E56]">第 2 步</p>
                <h2 id="task-action-title" className="mt-2 text-xl font-extrabold text-slate-950">照著完成，不用自己想文案</h2>
                <ol className="mt-6 max-w-2xl space-y-4">{current.task.steps.map((taskStep, index) => <li key={taskStep} className="grid grid-cols-[32px_1fr] gap-3 text-sm leading-7 text-slate-700"><span className="grid h-8 w-8 place-items-center rounded bg-slate-900 text-xs font-bold text-white">{index + 1}</span>{taskStep}</li>)}</ol>
                <div className="mt-8 max-w-2xl"><h3 className="text-sm font-extrabold text-slate-950">已替你準備</h3><div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{current.task.deliverables.map((item, index) => <article key={`${item.label}-${index}`} className="py-5"><div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-slate-900">{item.label}</h4><p className="mt-1 text-xs leading-5 text-slate-500">{item.usage}</p></div><Button type="button" variant="ghost" size="icon" title={`複製${item.label}`} aria-label={`複製${item.label}`} onClick={() => copy(item.content, index)}>{copied === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.content}</p></article>)}</div></div>
                <div className="mt-6 flex flex-wrap gap-3"><Button type="button" variant="ghost" onClick={() => setGuideStep(1)} className="font-bold"><ChevronLeft className="h-4 w-4" aria-hidden />回去看說明</Button><Button type="button" onClick={() => setGuideStep(3)} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">我已完成外部操作<ChevronRight className="h-4 w-4" aria-hidden /></Button></div>
              </section>
            )}

            {visibleGuideStep === 3 && verification && (
              <section className="py-8" aria-labelledby="task-record-title">
                <p className="text-xs font-extrabold text-[#0F6E56]">第 3 步</p>
                <h2 id="task-record-title" className="mt-2 text-xl font-extrabold text-slate-950">留下完成紀錄</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{current.task.successCheck}</p>
                <div className="mt-6 max-w-xl space-y-4 border-t border-slate-200 pt-5">
                  <div><p className="text-sm font-bold text-slate-900">這次記錄：{verification.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{verification.prompt}</p></div>
                  {verification.method === 'url' && <div className="space-y-2"><Label htmlFor="growth-evidence-url">完成後的公開網址</Label><Input id="growth-evidence-url" type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://..." /></div>}
                  {verification.method === 'before_after' && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="growth-before-value">執行前（{verification.unit ?? '數值'}）</Label><Input id="growth-before-value" type="number" min="0" step="any" inputMode="decimal" value={beforeValue} onChange={(event) => setBeforeValue(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="growth-after-value">目前（{verification.unit ?? '數值'}）</Label><Input id="growth-after-value" type="number" min="0" step="any" inputMode="decimal" value={afterValue} onChange={(event) => setAfterValue(event.target.value)} /></div></div>}
                  {verification.method === 'count' && <div className="space-y-2"><Label htmlFor="growth-evidence-count">實際數量（{verification.unit ?? '次'}）</Label><Input id="growth-evidence-count" type="number" min="1" step="1" inputMode="numeric" value={evidenceCount} onChange={(event) => setEvidenceCount(event.target.value)} /></div>}
                  {verification.method === 'confirmation' && <div className="flex items-start gap-3"><Checkbox id="growth-confirmed" checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} /><Label htmlFor="growth-confirmed" className="pt-0.5 leading-5">我已完成上方步驟，內容符合店家真實狀況</Label></div>}
                  <div className="space-y-2"><Label htmlFor="growth-result-note">這次遇到什麼？（選填）</Label><Textarea id="growth-result-note" value={completionNote} onChange={(event) => setCompletionNote(event.target.value)} maxLength={300} placeholder="例如：客人最常回覆哪一句、哪一步卡住" className="min-h-20 resize-none bg-white" /></div>
                  <div className="flex flex-wrap gap-3"><Button type="button" variant="ghost" onClick={() => setGuideStep(2)} className="font-bold"><ChevronLeft className="h-4 w-4" aria-hidden />回去看步驟</Button><Button onClick={complete} disabled={state === 'working'} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">{state === 'working' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}提交完成紀錄</Button></div>
                </div>
              </section>
            )}

            {visibleGuideStep === 4 && (
              <section className="py-8" aria-labelledby="task-result-title">
                <div className="max-w-2xl border-l-4 border-[#1D9E75] pl-5">
                  <p className="text-xs font-extrabold text-[#0F6E56]">第 4 步 · 已完成</p>
                  <h2 id="task-result-title" className="mt-2 flex items-center gap-2 text-xl font-extrabold text-slate-950"><ClipboardCheck className="h-5 w-5 text-[#1D9E75]" aria-hidden />本週成果已保存</h2>
                  <div className="mt-4 flex flex-wrap gap-2">{current.outcome_status && <Badge variant="outline">{outcomeLabel(current.outcome_status)}</Badge>}{current.confidence_level && <Badge variant="outline">紀錄完整度 {confidenceLabel(current.confidence_level)}</Badge>}</div>
                  {current.result_snapshot?.summary && <p className="mt-4 text-sm leading-7 text-slate-700">{current.result_snapshot.summary}</p>}
                  {current.next_recommendation && <p className="mt-3 text-sm leading-7 text-slate-500"><strong className="text-slate-700">系統建議的下一步：</strong>{current.next_recommendation.rationale}</p>}
                  {current.feedback?.note && <p className="mt-3 text-sm leading-6 text-slate-500">你的補充：{current.feedback.note}</p>}
                </div>
              </section>
            )}
          </div>
        )}
        {message && <p role="alert" className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{message}</p>}
      </div>

      <aside className="lg:border-l lg:border-slate-200 lg:pl-6">
        <h2 className="text-sm font-extrabold text-slate-950">需要更簡單？</h2><p className="mt-2 text-xs leading-5 text-slate-500">系統可以把任務縮短成 10 分鐘內完成。每週最多調整 4 次。</p>
        <Button type="button" variant="outline" onClick={() => generate('請改成更簡單、10 分鐘內可完成，而且不要使用行銷術語的任務。')} disabled={state === 'working' || currentCompleted} className="mt-4 w-full font-bold">改成 10 分鐘簡單版</Button>
        <details className="mt-4 border-t border-slate-200 pt-4"><summary className="cursor-pointer text-xs font-bold text-slate-600">我想自己說明要怎麼調整</summary><Textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} maxLength={300} disabled={currentCompleted} placeholder="例：不要促銷，改成專業教育角度" className="mt-3 min-h-24 resize-none bg-white" /></details>
        <Button type="button" variant="outline" onClick={() => generate()} disabled={state === 'working' || currentCompleted} className="mt-3 w-full font-bold">{state === 'working' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : currentCompleted ? <Check className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}{currentCompleted ? '本週已完成' : current ? '重新產生' : '產生任務'}</Button>
        {current?.feedback?.revisions?.length ? <div className="mt-4 border-l-2 border-slate-200 pl-3"><p className="text-xs font-bold text-slate-600">已記住 {current.feedback.revisions.length} 個舊版本</p><p className="mt-1 text-xs leading-5 text-slate-400">新版本仍會參考先前任務與你的調整。</p></div> : null}
        <div className="mt-8 border-t border-slate-200 pt-6"><h2 className="text-sm font-extrabold text-slate-950">過去成果</h2>{pastCycles.length === 0 ? <p className="mt-3 text-xs text-slate-500">完成第一週後會開始累積。</p> : <div className="mt-3 space-y-5">{pastCycles.slice(0, 8).map((cycle) => <div key={cycle.id}><div className="flex flex-wrap items-center gap-2"><p className="text-xs text-slate-400">{formatWeek(cycle.week_start)}</p>{cycle.confidence_level && <span className="text-xs text-slate-400">紀錄 {confidenceLabel(cycle.confidence_level)}</span>}</div><p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{cycle.task.title}</p><p className="mt-1 text-xs font-semibold text-slate-500">{cycle.outcome_status ? outcomeLabel(cycle.outcome_status) : cycle.status === 'completed' ? '已完成（舊版未驗證紀錄）' : '進行中'}</p>{cycle.result_snapshot?.summary ? <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-400">{cycle.result_snapshot.summary}</p> : cycle.feedback?.note && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{cycle.feedback.note}</p>}{cycle.next_recommendation && <p className="mt-1 text-xs leading-5 text-slate-500">下一步：{strategyLabel(cycle.next_recommendation.strategy)}</p>}</div>)}</div>}</div>
      </aside>
    </div>
  );
}

function dimensionLabel(value: string) { return ({ profile: '檔案完整度', reviews: '評論', reply: '回覆率', photos: '照片', keywords: '關鍵字', local: '在地相關性', content: '內容更新' } as Record<string, string>)[value] ?? value; }
function dimensionHelp(value: string) { return ({ profile: '讓客人看到完整而一致的店家資訊，降低找不到或不確定的情況。', reviews: '讓新客人看到更多真實經驗，增加聯絡或到店的信心。', reply: '讓留下評論的客人得到回應，也讓其他人看見店家有持續服務。', photos: '讓客人更快看懂現場、商品與服務內容。', keywords: '讓店家內容使用客人真正會搜尋的說法。', local: '讓附近的客人更容易判斷你的店是否適合他。', content: '持續提供最新資訊，避免店家頁面看起來沒有經營。' } as Record<string, string>)[value] ?? '讓客人更容易看懂、信任並採取下一步。'; }
function formatWeek(value: string) { const date = new Date(`${value}T00:00:00+08:00`); return `${date.getMonth() + 1}/${date.getDate()} 這週`; }
function isCurrentWeek(value: string) { const now = new Date(); const taipei = new Date(now.getTime() + 8 * 60 * 60 * 1000); const offset = (taipei.getUTCDay() + 6) % 7; taipei.setUTCDate(taipei.getUTCDate() - offset); return taipei.toISOString().slice(0, 10) === value; }
function metricValue(value: string) { const normalized = value.trim(); return normalized === '' ? undefined : Number(normalized); }
function outcomeLabel(value: NonNullable<CustomerGrowthCycle['outcome_status']>) { return ({ action_verified: '動作已驗證', verified_improvement: '觀察到改善', verified_no_change: '暫無變化', verified_regression: '需要換方向' } as const)[value]; }
function confidenceLabel(value: NonNullable<CustomerGrowthCycle['confidence_level']>) { return ({ low: '低', medium: '中', high: '高' } as const)[value]; }
function strategyLabel(value: NonNullable<CustomerGrowthCycle['next_recommendation']>['strategy']) { return ({ continue: '延續有效方向', adjust: '調整後再測', switch: '更換成長方向', measure: '先補量測' } as const)[value]; }
function verificationStageNumber(value: ReturnType<typeof buildCustomerGrowthProgress>['stage']) { return ({ starting: 0, recorded: 1, verified: 2, comparable: 3, repeatable: 4 } as const)[value]; }
function ProgressMetric({ label, value, icon: Icon }: { label: string; value: number; icon?: typeof Flame }) { return <div className="min-w-0 border-slate-200 px-3 py-3 odd:border-r sm:border-r sm:last:border-r-0"><p className="flex items-center gap-1 text-xs font-semibold text-slate-500">{Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}{label}</p><p className="mt-1 text-xl font-extrabold tabular-nums text-slate-950">{value}<span className="ml-1 text-xs font-semibold text-slate-400">週</span></p></div>; }

const taskGuideLabels = ['看懂任務', '照著完成', '留下紀錄', '查看成果'];

function TaskGuideSteps({ currentStep }: { currentStep: number }) {
  return (
    <ol className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4" aria-label={`本週任務，第 ${currentStep} 步，共 4 步`}>
      {taskGuideLabels.map((label, index) => {
        const number = index + 1;
        const complete = number < currentStep;
        const active = number === currentStep;
        return <li key={label} className={`flex min-h-14 items-center gap-2 border-b-2 px-2 py-3 text-xs font-bold sm:px-3 ${active ? 'border-[#1D9E75] text-slate-950' : 'border-transparent text-slate-400'}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${complete || active ? 'bg-[#1D9E75] text-white' : 'bg-slate-100'}`}>{complete ? <Check className="h-3.5 w-3.5" aria-hidden /> : number}</span><span>{label}</span></li>;
      })}
    </ol>
  );
}
