'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  History,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Save,
  Star,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReviewReplyVariant {
  label: string;
  angle: string;
  reply: string;
}

interface CustomerReviewDraft {
  id: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  owner_note: string | null;
  industry: string | null;
  selected_reply: string;
  reply_variants: ReviewReplyVariant[];
  tips: string[];
  status: 'draft' | 'copied';
  generated_at: string;
  updated_at: string;
}

interface Quota {
  count: number;
  limit: number;
  resetAt: number;
}

interface ApiResponse {
  ok: boolean;
  drafts?: CustomerReviewDraft[];
  draft?: CustomerReviewDraft;
  deletedId?: string;
  quota?: Quota | null;
  error?: { code: string; message: string };
}

const emptyForm = {
  reviewerName: '',
  rating: 5,
  reviewText: '',
  ownerNote: '',
};

export function ReviewWorkspace({ defaultIndustry }: { defaultIndustry: string }) {
  const [form, setForm] = useState(emptyForm);
  const [industry, setIndustry] = useState(defaultIndustry);
  const [drafts, setDrafts] = useState<CustomerReviewDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<CustomerReviewDraft | null>(null);
  const [selectedReply, setSelectedReply] = useState('');
  const [quota, setQuota] = useState<Quota | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const currentStep = copied ? 3 : activeDraft ? 2 : 1;
  const remaining = quota ? Math.max(quota.limit - quota.count, 0) : null;
  const resetTime = useMemo(() => {
    if (!quota) return null;
    return new Intl.DateTimeFormat('zh-TW', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(quota.resetAt);
  }, [quota]);

  useEffect(() => {
    void loadDrafts();
  }, []);

  async function loadDrafts() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/me/review-drafts', { cache: 'no-store' });
      const payload = await readApiResponse(response);
      if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? '讀取過去草稿失敗');
      setDrafts(payload.drafts ?? []);
      setQuota(payload.quota);
    } catch (loadError) {
      setError(messageFrom(loadError));
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    if (form.reviewText.trim().length < 5) {
      setError('請貼上至少 5 個字的公開評論。');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/me/review-drafts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, industry }),
      });
      const payload = await readApiResponse(response);
      if (!response.ok || !payload.ok || !payload.draft) {
        throw new Error(payload.error?.message ?? '產生回覆失敗');
      }
      setDrafts((current) => [payload.draft!, ...current.filter((draft) => draft.id !== payload.draft!.id)]);
      setQuota(payload.quota);
      selectDraft(payload.draft);
    } catch (generateError) {
      setError(messageFrom(generateError));
    } finally {
      setGenerating(false);
    }
  }

  function selectDraft(draft: CustomerReviewDraft) {
    setActiveDraft(draft);
    setSelectedReply(draft.selected_reply || draft.reply_variants[0]?.reply || '');
    setCopied(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function chooseVariant(variant: ReviewReplyVariant) {
    setSelectedReply(variant.reply);
    setCopied(false);
  }

  async function save(status: 'draft' | 'copied') {
    if (!activeDraft || selectedReply.trim().length < 4) {
      setError('回覆內容至少需要 4 個字。');
      return null;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/me/review-drafts/${activeDraft.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ selectedReply, status }),
      });
      const payload = await readApiResponse(response);
      if (!response.ok || !payload.ok || !payload.draft) {
        throw new Error(payload.error?.message ?? '儲存回覆失敗');
      }
      setActiveDraft(payload.draft);
      setDrafts((current) => current.map((draft) => (draft.id === payload.draft!.id ? payload.draft! : draft)));
      return payload.draft;
    } catch (saveError) {
      setError(messageFrom(saveError));
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function copyReply() {
    const saved = await save('copied');
    if (!saved) return;

    try {
      await navigator.clipboard.writeText(selectedReply);
      setCopied(true);
    } catch {
      setError('瀏覽器無法自動複製，請選取回覆文字後手動複製。');
    }
  }

  async function removeDraft(draft: CustomerReviewDraft) {
    if (!window.confirm('確定永久刪除這則草稿嗎？')) return;

    setError('');
    try {
      const response = await fetch(`/api/me/review-drafts/${draft.id}`, { method: 'DELETE' });
      const payload = await readApiResponse(response);
      if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? '刪除草稿失敗');
      setDrafts((current) => current.filter((item) => item.id !== draft.id));
      if (activeDraft?.id === draft.id) resetForNext();
    } catch (deleteError) {
      setError(messageFrom(deleteError));
    }
  }

  function resetForNext() {
    setForm(emptyForm);
    setActiveDraft(null);
    setSelectedReply('');
    setCopied(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-7">
      <WorkspaceSteps currentStep={currentStep} />

      {error ? (
        <div role="alert" className="border-y border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      ) : null}

      {currentStep === 1 ? (
        <section aria-labelledby="review-input-heading" className="border-y border-slate-200 bg-white px-4 py-7 sm:px-6 sm:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#0F6E56]">第 1 步</p>
              <h2 id="review-input-heading" className="mt-1 text-2xl font-extrabold text-slate-950">貼上客人的公開評論</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">先選星等，再貼上 Google 商家中已公開的評論。</p>
            </div>
            <QuotaBadge quota={quota} remaining={remaining} resetTime={resetTime} />
          </div>

          <div className="mt-7 max-w-3xl space-y-6">
            <fieldset>
              <legend className="text-sm font-extrabold text-slate-800">這則評論是幾顆星？</legend>
              <div className="mt-3 grid max-w-md grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    aria-label={`${rating} 顆星`}
                    aria-pressed={form.rating === rating}
                    onClick={() => setForm((current) => ({ ...current, rating }))}
                    className={`flex h-12 items-center justify-center gap-1 border text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75] ${
                      form.rating === rating
                        ? 'border-amber-400 bg-amber-50 text-amber-800'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${form.rating === rating ? 'fill-current' : ''}`} aria-hidden />
                    {rating}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-sm font-extrabold text-slate-800">公開評論內容</span>
              <textarea
                value={form.reviewText}
                onChange={(event) => setForm((current) => ({ ...current, reviewText: event.target.value }))}
                rows={7}
                maxLength={2_000}
                placeholder="例如：餐點很好吃，服務也很親切，下次還會再來。"
                className="mt-3 w-full resize-y border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-emerald-100"
              />
              <span className="mt-2 block text-right text-xs text-slate-500">{form.reviewText.length} / 2,000</span>
            </label>

            <details className="border-t border-slate-200 pt-4">
              <summary className="cursor-pointer text-sm font-extrabold text-slate-700">補充更多資料，讓回覆更準確（選填）</summary>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">評論者名稱</span>
                  <input
                    value={form.reviewerName}
                    onChange={(event) => setForm((current) => ({ ...current, reviewerName: event.target.value }))}
                    maxLength={100}
                    placeholder="例如：王小姐"
                    className="mt-2 h-11 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">店家類型</span>
                  <input
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    maxLength={80}
                    placeholder="例如：牙醫診所"
                    className="mt-2 h-11 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">只有店家知道的處理情況</span>
                  <textarea
                    value={form.ownerNote}
                    onChange={(event) => setForm((current) => ({ ...current, ownerNote: event.target.value }))}
                    rows={3}
                    maxLength={500}
                    placeholder="例如：當天設備臨時維修，已調整預約間隔。沒有就留白。"
                    className="mt-2 w-full resize-y border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            </details>

            <details className="border-t border-slate-200 pt-4 text-sm text-slate-600">
              <summary className="cursor-pointer font-extrabold text-slate-700">資料會怎麼使用？</summary>
              <p className="mt-3 max-w-2xl leading-6">
                評論內容會送交 AI 產生草稿並儲存在你的帳號。請先移除電話、病歷、訂單編號等未公開個資。adlo 不會自動發布到 Google。
              </p>
            </details>

            <Button
              type="button"
              onClick={() => void generate()}
              disabled={generating || remaining === 0}
              className="h-12 w-full bg-[#0F6E56] text-base font-extrabold text-white hover:bg-[#0B5945] sm:w-auto sm:min-w-64"
            >
              {generating ? <Loader2 className="animate-spin" aria-hidden /> : <MessageSquarePlus aria-hidden />}
              {generating ? '正在準備回覆...' : '幫我準備三種回覆'}
            </Button>
          </div>
        </section>
      ) : null}

      {currentStep === 2 && activeDraft ? (
        <section aria-labelledby="reply-choice-heading" className="border-y border-slate-200 bg-white px-4 py-7 sm:px-6 sm:py-8">
          <p className="text-sm font-bold text-[#0F6E56]">第 2 步</p>
          <h2 id="reply-choice-heading" className="mt-1 text-2xl font-extrabold text-slate-950">選一種最像你店家的說法</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">先選方向，再直接修改文字。公開前仍由你做最後確認。</p>

          <div className="mt-6 border-l-4 border-slate-300 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
              <Stars rating={activeDraft.rating} />
              {activeDraft.reviewer_name || '客人評論'}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{activeDraft.review_text}</p>
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-3">
            {activeDraft.reply_variants.map((variant) => {
              const selected = selectedReply === variant.reply;
              return (
                <button
                  key={`${activeDraft.id}-${variant.label}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseVariant(variant)}
                  className={`min-h-32 border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75] ${
                    selected ? 'border-[#1D9E75] bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-extrabold text-slate-900">{variant.label}</span>
                    {selected ? <Check className="h-5 w-5 shrink-0 text-[#0F6E56]" aria-hidden /> : null}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{variant.angle}</span>
                </button>
              );
            })}
          </div>

          <label className="mt-7 block max-w-4xl">
            <span className="text-sm font-extrabold text-slate-800">最後回覆文字</span>
            <textarea
              value={selectedReply}
              onChange={(event) => {
                setSelectedReply(event.target.value);
                setCopied(false);
              }}
              rows={8}
              maxLength={2_000}
              className="mt-3 w-full resize-y border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-slate-950 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-emerald-100"
            />
            <span className="mt-2 block text-right text-xs text-slate-500">{selectedReply.length} / 2,000</span>
          </label>

          {activeDraft.tips.length ? (
            <details className="mt-5 max-w-4xl border-t border-slate-200 pt-4">
              <summary className="cursor-pointer text-sm font-extrabold text-slate-700">公開前要確認什麼？</summary>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {activeDraft.tips.map((tip) => <li key={tip}>• {tip}</li>)}
              </ul>
            </details>
          ) : null}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="ghost" onClick={resetForNext} className="font-bold text-slate-700">換一則評論</Button>
            <Button type="button" variant="outline" onClick={() => void save('draft')} disabled={saving} className="font-bold">
              {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
              先儲存
            </Button>
            <Button type="button" onClick={() => void copyReply()} disabled={saving} className="h-11 bg-[#0F6E56] font-extrabold text-white hover:bg-[#0B5945] sm:min-w-48">
              {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Copy aria-hidden />}
              確認並複製
            </Button>
          </div>
        </section>
      ) : null}

      {currentStep === 3 && activeDraft ? (
        <section aria-labelledby="copy-complete-heading" className="border-y border-emerald-200 bg-emerald-50 px-4 py-8 sm:px-6">
          <CheckCircle2 className="h-10 w-10 text-[#0F6E56]" aria-hidden />
          <p className="mt-4 text-sm font-bold text-[#0F6E56]">第 3 步</p>
          <h2 id="copy-complete-heading" className="mt-1 text-2xl font-extrabold text-slate-950">回覆已複製</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">現在到 Google 商家貼上並送出。adlo 不會替你自動發布。</p>

          <div className="mt-6 max-w-3xl border border-emerald-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800">
            {selectedReply}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={resetForNext} className="h-11 bg-[#0F6E56] font-extrabold text-white hover:bg-[#0B5945] sm:min-w-48">
              <MessageSquarePlus aria-hidden />處理下一則評論
            </Button>
            <Button type="button" variant="outline" onClick={() => void navigator.clipboard.writeText(selectedReply)} className="font-bold">
              <Copy aria-hidden />再複製一次
            </Button>
            <Button type="button" variant="ghost" onClick={() => setCopied(false)} className="font-bold text-slate-700">回去修改</Button>
          </div>
        </section>
      ) : null}

      <details className="border-y border-slate-200 bg-white">
        <summary className="flex cursor-pointer items-center gap-3 px-4 py-5 font-extrabold text-slate-800 sm:px-6">
          <History className="h-5 w-5 text-slate-500" aria-hidden />
          過去草稿（{drafts.length}）
        </summary>
        <div className="border-t border-slate-200 px-4 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">最多顯示最近 50 則。點選即可繼續修改。</p>
            <Button type="button" variant="ghost" size="icon" onClick={() => void loadDrafts()} disabled={loading} aria-label="重新整理草稿">
              <RefreshCw className={loading ? 'animate-spin' : ''} aria-hidden />
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm font-semibold text-slate-500"><Loader2 className="animate-spin" aria-hidden />讀取草稿中...</div>
          ) : drafts.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">還沒有草稿。完成第一則後會保存在這裡。</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {drafts.map((draft) => (
                <div key={draft.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => selectDraft(draft)} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]">
                    <span className="flex flex-wrap items-center gap-2">
                      <Stars rating={draft.rating} />
                      <span className="text-sm font-extrabold text-slate-900">{draft.reviewer_name || '未填姓名'}</span>
                      {draft.status === 'copied' ? <Badge variant="outline" className="border-emerald-200 text-emerald-700">已複製</Badge> : null}
                    </span>
                    <span className="mt-2 block truncate text-sm text-slate-600">{draft.review_text}</span>
                    <span className="mt-1 block text-xs text-slate-400">{formatDate(draft.updated_at)}</span>
                  </button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => void removeDraft(draft)} aria-label="刪除草稿" className="self-end text-slate-500 hover:text-red-700 sm:self-auto">
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

function WorkspaceSteps({ currentStep }: { currentStep: number }) {
  const steps = ['貼上評論', '確認回覆', '複製完成'];
  return (
    <ol aria-label="評論回覆進度" className="grid grid-cols-3 border-y border-slate-200 bg-white">
      {steps.map((label, index) => {
        const step = index + 1;
        const complete = step < currentStep;
        const active = step === currentStep;
        return (
          <li key={label} aria-current={active ? 'step' : undefined} className={`flex min-h-20 flex-col items-center justify-center gap-1 border-r px-1 text-center text-xs font-extrabold last:border-r-0 sm:flex-row sm:gap-2 sm:px-2 sm:text-sm ${active ? 'bg-emerald-50 text-[#0F6E56]' : complete ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${active || complete ? 'border-[#1D9E75] bg-[#1D9E75] text-white' : 'border-slate-300 bg-white'}`}>
              {complete ? <Check className="h-3.5 w-3.5" aria-hidden /> : step}
            </span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function QuotaBadge({ quota, remaining, resetTime }: { quota: Quota | null | undefined; remaining: number | null; resetTime: string | null }) {
  if (quota === undefined) return <Badge variant="outline">讀取額度中</Badge>;
  if (quota === null) return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">額度暫時無法顯示</Badge>;
  return (
    <div className="text-left sm:text-right">
      <Badge variant="outline" className={remaining === 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}>
        今天還可產生 {remaining} 則
      </Badge>
      {resetTime ? <p className="mt-1 text-xs text-slate-500">約 {resetTime} 重置</p> : null}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${rating} 顆星`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={`h-3.5 w-3.5 ${index < rating ? 'fill-current' : 'text-slate-300'}`} aria-hidden />
      ))}
    </span>
  );
}

async function readApiResponse(response: Response): Promise<ApiResponse> {
  return response.json() as Promise<ApiResponse>;
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : '發生未預期錯誤，請稍後再試';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
