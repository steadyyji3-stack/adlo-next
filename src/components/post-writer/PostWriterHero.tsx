'use client';

import { useState, FormEvent, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PenLine, Shield, Clock, UserX, Wand2, Check } from 'lucide-react';
import PostWriterIllustration from './PostWriterIllustration';
import type { Industry, PostWriterInput } from './mock-data';
import { INDUSTRY_TAGS } from '@/lib/gbp-post-writer';

interface Props {
  onSubmit: (input: PostWriterInput) => void;
  errorMsg?: string | null;
}

const INDUSTRIES: Industry[] = [
  '餐飲',
  '美髮美容',
  '醫美',
  '牙科',
  '律師',
  '補教',
  '零售',
  '其他',
];

const TAG_RECOMMENDED_MIN = 1;
const TAG_RECOMMENDED_MAX = 5;
const TAG_HARD_MAX = 8;

export default function PostWriterHero({ onSubmit, errorMsg }: Props) {
  const [storeName, setStoreName] = useState('');
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [weekTheme, setWeekTheme] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  const tagGroups = useMemo(
    () => (industry ? INDUSTRY_TAGS[industry as Industry] : []),
    [industry],
  );

  function toggleTag(tag: string) {
    setError('');
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= TAG_HARD_MAX) {
        setError(`最多勾 ${TAG_HARD_MAX} 個標籤，超過會稀釋每篇貼文的聚焦度`);
        return prev;
      }
      return [...prev, tag];
    });
  }

  function handleIndustryChange(v: string) {
    setIndustry(v as Industry);
    setSelectedTags([]);
    setError('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (storeName.trim().length < 2) {
      setError('店名至少 2 個字');
      return;
    }
    if (!industry) {
      setError('請選擇你的產業類別');
      return;
    }
    if (weekTheme.trim().length > 60) {
      setError('本週主打請在 60 字以內');
      return;
    }
    setError('');
    onSubmit({
      storeName: storeName.trim(),
      industry: industry as Industry,
      weekTheme: weekTheme.trim() || undefined,
      selectedTags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  }

  const displayError = error || errorMsg || '';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-28 lg:py-32">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <PostWriterIllustration />

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            免費 · 不用註冊 · 3 秒出 7 篇
          </div>

          <h1 className="text-[32px] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            下週 7 天 GBP 貼文，<span className="text-[#1D9E75]">3 秒搞定</span>。
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Google 商家貼文初稿。節慶、教育、客戶見證、幕後、新品、促銷、QA 自動配，每週不再卡題。
          </p>

          <div className="mt-6 mx-auto max-w-xl flex items-start gap-3 text-left bg-white/70 backdrop-blur-sm border border-emerald-200 rounded-xl p-4">
            <Wand2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" aria-hidden />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-emerald-800">不是 AI 聊天工具。</strong>
              選擇預設標籤、不用打字思考。標籤組合 → 7 篇 ship-ready 初稿。
              不用反覆 prompt、不用「請幫我修改一下語氣」。
            </p>
          </div>
        </div>

        {/* 表單 */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8"
        >
          <div className="space-y-5">
            <div>
              <Label
                htmlFor="store-name"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                店名 <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="例：榮芳商行"
                className="h-12 text-base"
                aria-required="true"
                maxLength={40}
              />
            </div>

            <div>
              <Label
                htmlFor="industry"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                產業類別 <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={industry}
                onValueChange={handleIndustryChange}
              >
                <SelectTrigger
                  id="industry"
                  className="h-12 text-base"
                  aria-required="true"
                >
                  <SelectValue placeholder="選一個（影響可用的標籤池）" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((it) => (
                    <SelectItem key={it} value={it}>
                      {it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-slate-500">
                選了之後下方會出現該產業的 3 組標籤池。
              </p>
            </div>

            <div>
              <Label
                htmlFor="week-theme"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                本週主打 <span className="text-slate-400 font-normal text-xs">（選填，60 字內）</span>
              </Label>
              <Input
                id="week-theme"
                type="text"
                value={weekTheme}
                onChange={(e) => setWeekTheme(e.target.value)}
                placeholder="例：母親節活動 / 新品上市 / 連假營業時間"
                className="h-12 text-base"
                maxLength={60}
              />
            </div>

            {/* ─── 動態標籤池 ─── */}
            {tagGroups.length > 0 && (
              <div className="pt-2">
                <div className="flex items-baseline justify-between gap-3 mb-3">
                  <Label className="text-sm font-semibold text-slate-900">
                    勾選相關標籤{' '}
                    <span className="text-slate-400 font-normal text-xs">
                      （建議 {TAG_RECOMMENDED_MIN}-{TAG_RECOMMENDED_MAX} 個）
                    </span>
                  </Label>
                  <span
                    className="text-xs text-slate-400 tabular-nums shrink-0"
                    aria-live="polite"
                  >
                    已選 {selectedTags.length} 個
                  </span>
                </div>

                <div className="space-y-5">
                  {tagGroups.map((group) => (
                    <fieldset key={group.key} className="space-y-2">
                      <legend className="text-xs font-bold text-slate-700 mb-1.5">
                        🏷️ {group.label}
                        <span className="font-normal text-slate-400 ml-1.5">
                          · {group.description}
                        </span>
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {group.tags.map((tag) => {
                          const isOn = selectedTags.includes(tag);
                          return (
                            <button
                              type="button"
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              aria-pressed={isOn}
                              className={[
                                'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
                                isOn
                                  ? 'bg-[#1D9E75] text-white border-[#1D9E75] hover:bg-[#168060]'
                                  : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50',
                              ].join(' ')}
                              data-gtm-event={`post_writer_tag_${group.key}`}
                            >
                              {isOn && <Check className="w-3 h-3" aria-hidden />}
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>

                <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                  勾的標籤會自然嵌入 <strong>節慶 / 教育 / 新品</strong> 三篇——產出的文案直接用你選的關鍵詞當主軸。
                </p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
              data-gtm-event="post_writer_generate"
            >
              <PenLine className="w-4 h-4 mr-2" aria-hidden />
              產生這週 7 篇 GBP 貼文
            </Button>

            {displayError && (
              <p role="alert" className="text-sm text-rose-600 text-center">
                {displayError}
              </p>
            )}
          </div>
        </form>

        {/* 信任列 */}
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊
          </li>
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" aria-hidden /> 不抓店家資料
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock className="size-4 text-emerald-600" aria-hidden /> 3 秒出 7 篇
          </li>
        </ul>
      </div>
    </section>
  );
}
