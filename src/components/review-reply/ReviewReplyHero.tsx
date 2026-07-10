'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquareReply, Star, UserX, Shield, Zap } from 'lucide-react';

export interface ReviewReplyFormValue {
  rating: number;
  reviewText: string;
  industry?: string;
  ownerNote?: string;
}

interface Props {
  onSubmit: (input: ReviewReplyFormValue) => void;
  errorMsg?: string | null;
}

const RATING_HINTS: Record<number, string> = {
  1: '負評 — 冷靜、不狡辯、邀請私下處理',
  2: '負評 — 冷靜、不狡辯、邀請私下處理',
  3: '中評 — 承接不滿、說明會怎麼調整',
  4: '好評 — 真誠感謝、呼應細節',
  5: '好評 — 真誠感謝、輕邀請再訪',
};

export default function ReviewReplyHero({ onSubmit, errorMsg }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [industry, setIndustry] = useState('');
  const [ownerNote, setOwnerNote] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError('先選這則評論是幾顆星');
      return;
    }
    if (reviewText.trim().length < 5) {
      setError('貼上評論內容（至少 5 個字）');
      return;
    }
    if (reviewText.trim().length > 500) {
      setError('評論內容請在 500 字以內');
      return;
    }
    setError('');
    onSubmit({
      rating,
      reviewText: reviewText.trim(),
      industry: industry.trim() || undefined,
      ownerNote: ownerNote.trim() || undefined,
    });
  }

  const displayError = error || errorMsg || '';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-24">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E1F5EE] border border-[#1D9E75]/30 mb-5">
            <MessageSquareReply className="w-7 h-7 text-[#1D9E75]" aria-hidden />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            免費 · 不用註冊 · 連負評也幫你回
          </div>

          <h1 className="text-[30px] sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.15]">
            收到評論，<span className="text-[#1D9E75]">3 種回覆</span>幫你寫好
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            貼上客人的評論，30 秒拿到 3 種語氣的回覆初稿。好評加溫、負評不失風度——公開回覆是寫給「下一個還沒上門的客人」看的。
          </p>

          <div className="mt-6 mx-auto max-w-xl flex items-start gap-3 text-left bg-white/70 backdrop-blur-sm border border-emerald-200 rounded-xl p-4">
            <Zap className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" aria-hidden />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-emerald-800">回覆率是 Google 在地排名訊號。</strong>
              每則都回、回得好，地圖會加分，潛在客也更敢上門。
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8 space-y-6"
        >
          {/* 星等 */}
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              這則評論幾顆星？ <span className="text-rose-500">*</span>
            </Label>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="評論星等">
              {[1, 2, 3, 4, 5].map((n) => {
                const on = rating >= n;
                return (
                  <button
                    type="button"
                    key={n}
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} 星`}
                    onClick={() => { setRating(n); setError(''); }}
                    className="p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${on ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'}`}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-xs text-slate-500" aria-live="polite">
                {RATING_HINTS[rating]}
              </p>
            )}
          </div>

          {/* 評論內容 */}
          <div>
            <Label htmlFor="review-text" className="text-sm font-semibold text-slate-900 mb-2 block">
              客人的評論內容 <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => { setReviewText(e.target.value); setError(''); }}
              placeholder="貼上客人在 Google 商家寫的評論原文。例：等了快一小時才上菜，雖然餐點好吃但實在太久了…"
              className="min-h-[110px] text-base resize-y"
              maxLength={500}
              aria-required="true"
            />
            <p className="mt-1.5 text-xs text-slate-400 text-right tabular-nums">{reviewText.length}/500</p>
          </div>

          {/* 店家類型（選填） */}
          <div>
            <Label htmlFor="rr-industry" className="text-sm font-semibold text-slate-900 mb-2 block">
              店家類型 <span className="text-slate-500 font-normal text-xs">（選填，幫助拿捏語氣）</span>
            </Label>
            <Input
              id="rr-industry"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="例：日式餐廳 / 美髮沙龍 / 牙醫診所"
              className="h-12 text-base"
              maxLength={20}
            />
          </div>

          {/* 老闆補充（選填） */}
          <div>
            <Label htmlFor="owner-note" className="text-sm font-semibold text-slate-900 mb-2 block">
              你想補充或回應的點 <span className="text-slate-500 font-normal text-xs">（選填）</span>
            </Label>
            <Textarea
              id="owner-note"
              value={ownerNote}
              onChange={(e) => setOwnerNote(e.target.value)}
              placeholder="例：那天剛好臨時缺一個人手 / 我們已經調整了出餐動線 / 想邀他下次報名字招待甜點"
              className="min-h-[70px] text-base resize-y"
              maxLength={150}
            />
            <p className="mt-1.5 text-xs text-slate-400 text-right tabular-nums">{ownerNote.length}/150</p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
            data-gtm-event="review_reply_generate"
          >
            <MessageSquareReply className="w-4 h-4 mr-2" aria-hidden />
            產生 3 種回覆
          </Button>

          {displayError && (
            <p role="alert" className="text-sm text-rose-600 text-center">
              {displayError}
            </p>
          )}
        </form>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊
          </li>
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" aria-hidden /> 不存評論內容
          </li>
          <li className="inline-flex items-center gap-2">
            <Star className="size-4 text-emerald-600" aria-hidden /> 好評負評都能回
          </li>
        </ul>
      </div>
    </section>
  );
}
