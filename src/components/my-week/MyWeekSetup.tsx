'use client';

import { useState, FormEvent, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, Save } from 'lucide-react';
import { INDUSTRY_TAGS, type Industry } from '@/lib/gbp-post-writer';
import type { StoreProfile, StoreProfileInput } from '@/lib/store-profile';

interface Props {
  /** 編輯模式時帶入既有檔案 */
  initial?: StoreProfile | null;
  onSave: (input: StoreProfileInput) => void;
  onCancel?: () => void;
}

const INDUSTRIES: Industry[] = [
  '餐飲', '美髮美容', '醫美', '牙科', '律師', '補教', '零售', '其他',
];

const TAG_HARD_MAX = 8;

export default function MyWeekSetup({ initial, onSave, onCancel }: Props) {
  const [storeName, setStoreName] = useState(initial?.storeName ?? '');
  const [industry, setIndustry] = useState<Industry | ''>(initial?.industry ?? '');
  const [weekTheme, setWeekTheme] = useState(initial?.weekTheme ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.selectedTags ?? []);
  const [error, setError] = useState('');

  const tagGroups = useMemo(
    () => (industry ? INDUSTRY_TAGS[industry as Industry] : []),
    [industry],
  );

  function toggleTag(tag: string) {
    setError('');
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= TAG_HARD_MAX) {
        setError(`最多勾 ${TAG_HARD_MAX} 個標籤`);
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
    const name = storeName.trim();
    if (name.length < 2 || name.length > 40) return setError('店名請輸入 2–40 字');
    if (!industry) return setError('請選一個產業類別');
    if (weekTheme.trim().length > 60) return setError('本週主題請在 60 字以內');
    setError('');
    onSave({
      storeName: name,
      industry: industry as Industry,
      selectedTags,
      weekTheme: weekTheme.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8"
    >
      <div className="space-y-5">
        <div>
          <Label htmlFor="sp-store-name" className="text-sm font-semibold text-slate-900 mb-2 block">
            店名 <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="sp-store-name"
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
          <Label htmlFor="sp-industry" className="text-sm font-semibold text-slate-900 mb-2 block">
            產業類別 <span className="text-rose-500">*</span>
          </Label>
          <Select value={industry} onValueChange={handleIndustryChange}>
            <SelectTrigger id="sp-industry" className="h-12 text-base" aria-required="true">
              <SelectValue placeholder="選一個（影響可用的標籤池）" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((it) => (
                <SelectItem key={it} value={it}>{it}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sp-week-theme" className="text-sm font-semibold text-slate-900 mb-2 block">
            本週主題 <span className="text-slate-400 font-normal text-xs">（選填，60 字內）</span>
          </Label>
          <Input
            id="sp-week-theme"
            type="text"
            value={weekTheme}
            onChange={(e) => setWeekTheme(e.target.value)}
            placeholder="例：母親節限定組合上市"
            className="h-12 text-base"
            maxLength={60}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            每週可以改這欄，其他不用重填。
          </p>
        </div>

        {tagGroups.length > 0 && (
          <div className="pt-1">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <Label className="text-sm font-semibold text-slate-900">
                勾選相關標籤 <span className="text-slate-400 font-normal text-xs">（建議 1-5 個）</span>
              </Label>
              <span className="text-xs text-slate-400 tabular-nums shrink-0" aria-live="polite">
                已選 {selectedTags.length} 個
              </span>
            </div>
            <div className="space-y-5">
              {tagGroups.map((group) => (
                <fieldset key={group.key} className="space-y-2">
                  <legend className="text-xs font-bold text-slate-700 mb-1.5">
                    🏷️ {group.label}
                    <span className="font-normal text-slate-400 ml-1.5">· {group.description}</span>
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
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            type="submit"
            size="lg"
            className="flex-1 h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
            data-gtm-event="my_week_save_profile"
          >
            <Save className="w-4 h-4 mr-2" aria-hidden />
            存成我的店家檔案
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 text-base"
              onClick={onCancel}
            >
              取消
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          檔案只存在你這台裝置的瀏覽器，<strong>不會上傳伺服器</strong>。
          換裝置或清快取會需要重設。
        </p>

        {error && (
          <p role="alert" className="text-sm text-rose-600 text-center">{error}</p>
        )}
      </div>
    </form>
  );
}
