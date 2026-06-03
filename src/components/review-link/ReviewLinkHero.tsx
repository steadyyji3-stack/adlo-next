'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCode, Shield, Clock, UserX, ExternalLink } from 'lucide-react';
import ReviewLinkIllustration from './ReviewLinkIllustration';
import NotAIChatBadge from '@/components/shared/NotAIChatBadge';
import { HOW_TO_FIND_REVIEW_LINK } from '@/lib/review-link';

export interface ReviewFormValue {
  storeName: string;
  industry: string;
  reviewUrl: string;
}

interface Props {
  onSubmit: (value: ReviewFormValue) => void;
}

/** 產業分組（影響模板措辭與下拉選單分區顯示） */
const INDUSTRY_GROUPS: { label: string; items: string[] }[] = [
  {
    label: '餐飲',
    items: [
      '餐飲',
      '餐廳 / 正餐',
      '小吃 / 便當',
      '咖啡 / 飲料店',
      '甜點 / 烘焙',
      '麵包店',
    ],
  },
  {
    label: '美容 / 美髮',
    items: ['美髮 / 美容', '美甲 / 美睫', 'SPA / 按摩'],
  },
  {
    label: '健康 / 醫療',
    items: ['健身 / 瑜伽', '牙醫 / 診所', '醫美', '寵物服務'],
  },
  {
    label: '其他服務',
    items: ['零售 / 服飾', '住宿 / 民宿', '律師 / 會計', '補習 / 家教', '其他'],
  },
];

export default function ReviewLinkHero({ onSubmit }: Props) {
  const [storeName, setStoreName] = useState('');
  const [industry, setIndustry] = useState('');
  const [reviewUrl, setReviewUrl] = useState('');
  const [error, setError] = useState('');
  const [showHow, setShowHow] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (storeName.trim().length < 2) {
      setError('店名至少 2 個字');
      return;
    }
    if (!reviewUrl.trim()) {
      setError('請貼上 Google 評論連結');
      return;
    }
    setError('');
    onSubmit({
      storeName: storeName.trim(),
      industry: industry.trim(),
      reviewUrl: reviewUrl.trim(),
    });
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <ReviewLinkIllustration />

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            免費 · 不用註冊 · 立刻產出
          </div>

          <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            一條連結 + QRCode
            <br className="md:hidden" />
            <span className="text-[#1D9E75]"> + 三版訊息模板</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            從 Google 商家後台拿到評論連結後，<strong className="text-slate-900">3 秒產出</strong>能印 / 能傳 / 能寄的全套素材。
            客人少打 5 步驟就能寫評論。
          </p>

          <NotAIChatBadge
            flow="貼 GBP 連結 → QR Code + 6 套訊息模板"
            detail="結構化模板，不是聊出來的。LINE / 紙卡 / Email 三通路全配齊，複製就能用。"
            className="mt-6"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8"
        >
          <div className="space-y-5">
            <div>
              <Label htmlFor="store-name" className="text-sm font-semibold text-slate-900 mb-2 block">
                店名 <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="例：好初早餐 信義店"
                className="h-12 text-base"
                aria-required="true"
              />
            </div>

            <div>
              <Label htmlFor="industry" className="text-sm font-semibold text-slate-900 mb-2 block">
                產業類別 <span className="text-slate-400 font-normal text-xs">（選填，影響模板措辭）</span>
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry" className="h-12 text-base">
                  <SelectValue placeholder="選一個（不選會用「本店」這類通用詞）" />
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  {INDUSTRY_GROUPS.map((group, idx) => (
                    <SelectGroup key={group.label}>
                      {idx > 0 && <div className="h-px bg-slate-200 my-1 mx-2" aria-hidden />}
                      <SelectLabel className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 px-3 py-2">
                        {group.label}
                      </SelectLabel>
                      {group.items.map((it) => (
                        <SelectItem key={it} value={it}>
                          {it}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="review-url" className="text-sm font-semibold text-slate-900 mb-2 block">
                Google 評論連結 <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="review-url"
                type="url"
                value={reviewUrl}
                onChange={(e) => setReviewUrl(e.target.value)}
                placeholder="https://g.page/r/.../review"
                className="h-12 text-base"
                aria-required="true"
                aria-describedby="review-url-help"
              />
              <button
                type="button"
                id="review-url-help"
                onClick={() => setShowHow(!showHow)}
                className="mt-2 text-xs font-bold text-[#1D9E75] hover:underline inline-flex items-center gap-1"
                aria-expanded={showHow}
              >
                {showHow ? '收起' : '不知道怎麼拿這條連結？'}
                <ExternalLink className="w-3 h-3" aria-hidden />
              </button>

              {showHow && (
                <ol className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  {HOW_TO_FIND_REVIEW_LINK.map((s) => (
                    <li key={s.step} className="flex gap-3">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {s.step}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{s.title}</p>
                        <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{s.body}</p>
                      </div>
                    </li>
                  ))}
                  <li className="text-xs text-slate-500 pl-8 pt-1 border-t border-slate-200 mt-2">
                    💡 沒辦法拿到 g.page 連結也沒關係，貼任何 Google 地圖 URL 都行（我們會提示這不是最佳連結）
                  </li>
                </ol>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
              data-gtm-event="review_link_generate"
            >
              <QrCode className="w-4 h-4 mr-2" aria-hidden />
              產出 QR + 訊息模板
            </Button>

            {error && (
              <p role="alert" className="text-sm text-rose-600 text-center">
                {error}
              </p>
            )}
          </div>
        </form>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊
          </li>
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" aria-hidden /> 不存你的資料
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock className="size-4 text-emerald-600" aria-hidden /> 3 秒產出
          </li>
        </ul>
      </div>
    </section>
  );
}
