'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Loader2, MessageSquarePlus, Save, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

interface ApiResponse {
  ok: boolean;
  drafts?: CustomerReviewDraft[];
  draft?: CustomerReviewDraft;
  deletedId?: string;
  quota?: { count: number; limit: number; resetAt: number };
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
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ count: number; limit: number } | null>(null);

  useEffect(() => {
    void loadDrafts();
  }, []);

  const selectedVariantIndex = useMemo(
    () => activeDraft?.reply_variants.findIndex((variant) => variant.reply === selectedReply) ?? -1,
    [activeDraft, selectedReply],
  );

  async function loadDrafts() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/me/review-drafts', { cache: 'no-store' });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(data.error?.message ?? '讀取評論草稿失敗');
      setDrafts(data.drafts ?? []);
      setQuota(data.quota ? { count: data.quota.count, limit: data.quota.limit } : null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '讀取評論草稿失敗');
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch('/api/me/review-drafts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, industry }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.draft) throw new Error(data.error?.message ?? '產生評論草稿失敗');

      setDrafts((current) => [data.draft as CustomerReviewDraft, ...current]);
      selectDraft(data.draft);
      setQuota(data.quota ? { count: data.quota.count, limit: data.quota.limit } : null);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : '產生評論草稿失敗');
    } finally {
      setGenerating(false);
    }
  }

  function selectDraft(draft: CustomerReviewDraft) {
    setActiveDraft(draft);
    setSelectedReply(draft.selected_reply);
    setCopied(false);
  }

  function chooseVariant(index: number) {
    const variant = activeDraft?.reply_variants[index];
    if (!variant) return;
    setSelectedReply(variant.reply);
    setCopied(false);
  }

  async function save(status: 'draft' | 'copied' = 'draft') {
    if (!activeDraft) return null;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/me/review-drafts/${activeDraft.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ selectedReply, status }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.draft) throw new Error(data.error?.message ?? '儲存評論草稿失敗');

      setActiveDraft(data.draft);
      setDrafts((current) => current.map((draft) => draft.id === data.draft?.id ? data.draft : draft));
      return data.draft;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '儲存評論草稿失敗');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function copyReply() {
    if (!selectedReply || !navigator.clipboard) {
      setError('此瀏覽器無法自動複製，請手動選取草稿文字');
      return;
    }
    try {
      const saved = await save('copied');
      if (!saved) return;
      await navigator.clipboard.writeText(selectedReply);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_800);
    } catch {
      setError('無法複製，請手動選取草稿文字');
    }
  }

  async function removeDraft(draftId: string) {
    if (!window.confirm('確定刪除這則評論草稿？刪除後無法復原。')) return;
    setError(null);
    try {
      const response = await fetch(`/api/me/review-drafts/${draftId}`, { method: 'DELETE' });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(data.error?.message ?? '刪除評論草稿失敗');
      setDrafts((current) => current.filter((draft) => draft.id !== draftId));
      if (activeDraft?.id === draftId) {
        setActiveDraft(null);
        setSelectedReply('');
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '刪除評論草稿失敗');
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <div className="space-y-8">
        <section className="border-y border-slate-200 bg-white px-4 py-6 sm:px-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950">新增評論</h2>
              <p className="mt-1 text-sm text-slate-500">每日 20 則；成功產生後才計入額度。</p>
            </div>
            {quota && <Badge variant="outline">今日 {quota.count}/{quota.limit}</Badge>}
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="reviewer-name">評論者名稱（選填）</Label>
              <Input id="reviewer-name" className="mt-2" maxLength={100} value={form.reviewerName} onChange={(event) => setForm((current) => ({ ...current, reviewerName: event.target.value }))} placeholder="例如：王小姐" />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-slate-900">評論星等</legend>
              <div className="mt-2 grid grid-cols-5 gap-2" role="radiogroup" aria-label="評論星等">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    role="radio"
                    aria-checked={form.rating === rating}
                    onClick={() => setForm((current) => ({ ...current, rating }))}
                    className={`flex h-11 items-center justify-center gap-1 rounded-md border text-sm font-bold transition-colors ${form.rating === rating ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                  >
                    <Star className={`h-4 w-4 ${form.rating === rating ? 'fill-amber-400' : ''}`} aria-hidden />{rating}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="review-text">評論原文</Label>
                <span className="text-xs tabular-nums text-slate-400">{form.reviewText.length}/2000</span>
              </div>
              <Textarea id="review-text" className="mt-2 min-h-36" maxLength={2_000} value={form.reviewText} onChange={(event) => setForm((current) => ({ ...current, reviewText: event.target.value }))} placeholder="貼上客人的公開評論內容" />
            </div>

            <div>
              <Label htmlFor="owner-note">店家補充（選填）</Label>
              <Textarea id="owner-note" className="mt-2 min-h-24" maxLength={500} value={form.ownerNote} onChange={(event) => setForm((current) => ({ ...current, ownerNote: event.target.value }))} placeholder="只填可公開、且確定正確的處理資訊" />
            </div>

            <div>
              <Label htmlFor="industry">店家類型（選填）</Label>
              <Input id="industry" className="mt-2" maxLength={80} value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="例如：牙醫診所、餐廳、零售門市" />
            </div>

            {error && <p role="alert" className="border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</p>}

            <Button type="button" onClick={generate} disabled={generating || form.reviewText.trim().length < 5} className="w-full bg-[#0F6E56] font-bold text-white hover:bg-[#0B5946] sm:w-auto">
              {generating ? <Loader2 className="animate-spin" aria-hidden /> : <MessageSquarePlus aria-hidden />}
              {generating ? '正在產生草稿' : '產生三種回覆'}
            </Button>
          </div>
        </section>

        <section className="border-y border-sky-200 bg-sky-50 px-4 py-5 text-sm leading-6 text-sky-950 sm:px-6">
          <h2 className="font-extrabold">資料與發布提醒</h2>
          <p className="mt-1">評論原文與店家補充會傳送至 AI 服務並儲存在 adlo 資料庫。請先移除非公開個資；所有結果都是待人工確認的草稿，adlo 不會自動發布到 Google。</p>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950">草稿歷史</h2>
              <p className="mt-1 text-sm text-slate-500">保留最近 50 筆，可重新開啟、複製或刪除。</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadDrafts()} disabled={loading}>重新整理</Button>
          </div>

          {loading ? (
            <div className="flex min-h-32 items-center justify-center border-y border-slate-200 bg-white"><Loader2 className="h-5 w-5 animate-spin text-[#0F6E56]" aria-label="讀取中" /></div>
          ) : drafts.length === 0 ? (
            <p className="border-y border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">尚無評論草稿。</p>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <article key={draft.id} className={`rounded-lg border bg-white p-4 ${activeDraft?.id === draft.id ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <button type="button" onClick={() => selectDraft(draft)} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900">{draft.reviewer_name || '未填名稱'}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700"><Star className="h-3.5 w-3.5 fill-amber-400" aria-hidden />{draft.rating}</span>
                        {draft.status === 'copied' && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">已複製</Badge>}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{draft.review_text}</p>
                      <time className="mt-2 block text-xs text-slate-400">{formatDate(draft.generated_at)}</time>
                    </button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => void removeDraft(draft.id)} aria-label="刪除評論草稿" title="刪除評論草稿"><Trash2 aria-hidden /></Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        {!activeDraft ? (
          <div className="border-y border-slate-200 bg-white px-5 py-12 text-center sm:px-6">
            <MessageSquarePlus className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-lg font-extrabold text-slate-900">回覆編輯區</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">產生新草稿，或從左側歷史選一筆繼續編輯。</p>
          </div>
        ) : (
          <section className="border-y border-slate-200 bg-white px-4 py-6 sm:px-6">
            <div className="mb-5">
              <h2 className="text-lg font-extrabold text-slate-950">選擇回覆角度</h2>
              <p className="mt-1 text-sm text-slate-500">選一版作為底稿，再依實際情況修改。</p>
            </div>

            <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="回覆版本">
              {activeDraft.reply_variants.map((variant, index) => (
                <button
                  key={`${activeDraft.id}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={selectedVariantIndex === index}
                  onClick={() => chooseVariant(index)}
                  className={`min-h-11 rounded-md border px-2 py-2 text-xs font-bold transition-colors ${selectedVariantIndex === index ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {variant.label}
                </button>
              ))}
            </div>

            {selectedVariantIndex >= 0 && <p className="mt-3 text-xs leading-5 text-slate-500">{activeDraft.reply_variants[selectedVariantIndex].angle}</p>}

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="selected-reply">公開回覆草稿</Label>
                <span className="text-xs tabular-nums text-slate-400">{selectedReply.length}/2000</span>
              </div>
              <Textarea id="selected-reply" className="mt-2 min-h-64" maxLength={2_000} value={selectedReply} onChange={(event) => { setSelectedReply(event.target.value); setCopied(false); }} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void save('draft')} disabled={saving || selectedReply.trim().length < 4} className="font-bold">
                {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}儲存
              </Button>
              <Button type="button" onClick={() => void copyReply()} disabled={saving || selectedReply.trim().length < 4} className="bg-[#0F6E56] font-bold text-white hover:bg-[#0B5946]">
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}{copied ? '已複製' : '儲存並複製'}
              </Button>
            </div>

            {activeDraft.tips.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-extrabold text-slate-900">公開前確認</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {activeDraft.tips.map((tip) => <li key={tip} className="border-l-2 border-amber-300 pl-3">{tip}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
