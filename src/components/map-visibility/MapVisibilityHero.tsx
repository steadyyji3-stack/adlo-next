'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPinned, UserX, Shield, Gauge, Check } from 'lucide-react';
import type {
  MapVisibilityInput,
  MapVisibilityStatus,
  PhotoLevel,
  ReviewLevel,
} from '@/lib/map-visibility';

interface Props {
  onSubmit: (input: MapVisibilityInput) => void;
}

const INDUSTRY_GROUPS: { label: string; items: string[] }[] = [
  { label: '餐飲', items: ['餐廳 / 正餐', '小吃 / 便當', '咖啡 / 飲料店', '甜點 / 烘焙'] },
  { label: '美容 / 健康', items: ['美髮 / 美容', '美甲 / 美睫', 'SPA / 按摩', '健身 / 瑜伽', '醫美', '牙科'] },
  { label: '生活服務', items: ['零售 / 服飾', '住宿 / 民宿', '寵物服務', '花藝 / 園藝', '攝影'] },
  { label: '裝潢修繕', items: ['裝潢', '裝修', '安裝', '維修'] },
  { label: '專業服務', items: ['律師 / 會計', '補習 / 教育', '顧問 / 諮詢', '其他'] },
];

const BOOLEAN_CHECKS: { key: keyof MapVisibilityStatus; label: string }[] = [
  { key: 'hasGbp', label: '已建立並認領 Google 商家檔案' },
  { key: 'categorySet', label: '已設定商家類別（主 + 次）' },
  { key: 'napConsistent', label: '店名 / 電話 / 地址在各平台一致' },
  { key: 'hoursFilled', label: '營業時間已填完整（含特休）' },
  { key: 'postedLast30d', label: '近 30 天有發過 GBP 貼文' },
  { key: 'repliesReviews', label: '有在回覆顧客評論' },
];

const PHOTO_LEVELS: { value: PhotoLevel; label: string }[] = [
  { value: 'none', label: '沒有' },
  { value: 'few', label: '1–5 張' },
  { value: 'some', label: '6–20 張' },
  { value: 'many', label: '20 張以上' },
];

const REVIEW_LEVELS: { value: ReviewLevel; label: string }[] = [
  { value: 'none', label: '沒有' },
  { value: 'low', label: '1–20 則' },
  { value: 'mid', label: '21–100 則' },
  { value: 'high', label: '100 則以上' },
];

export default function MapVisibilityHero({ onSubmit }: Props) {
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [photoCount, setPhotoCount] = useState<PhotoLevel>('few');
  const [reviewCount, setReviewCount] = useState<ReviewLevel>('low');
  const [error, setError] = useState('');

  function toggle(key: string) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!industry) {
      setError('請選擇你的行業別');
      return;
    }
    if (city.trim().length < 2) {
      setError('請填寫你的地區（至少 2 個字，例：台中西區）');
      return;
    }
    if (keyword.trim().length > 30) {
      setError('關鍵字請在 30 字以內');
      return;
    }
    setError('');
    onSubmit({
      industry,
      city: city.trim(),
      keyword: keyword.trim() || undefined,
      status: {
        hasGbp: !!checks.hasGbp,
        categorySet: !!checks.categorySet,
        napConsistent: !!checks.napConsistent,
        hoursFilled: !!checks.hoursFilled,
        postedLast30d: !!checks.postedLast30d,
        repliesReviews: !!checks.repliesReviews,
        photoCount,
        reviewCount,
      },
    });
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E1F5EE] border border-[#1D9E75]/30 mb-5">
            <MapPinned className="w-7 h-7 text-[#1D9E75]" aria-hidden />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            免費 · 不用註冊 · 不抓店家資料
          </div>

          <h1 className="text-[30px] sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.15]">
            如何做好你的 <span className="text-[#1D9E75]">Google 地圖顯示</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            勾選你目前的現況，30 秒拿到一份依優先序排好的「地圖曝光優化行動清單」——先做哪件、為什麼、哪支工具能代勞。
          </p>

          <div className="mt-6 mx-auto max-w-xl flex items-start gap-3 text-left bg-white/70 backdrop-blur-sm border border-emerald-200 rounded-xl p-4">
            <Gauge className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" aria-hidden />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-emerald-800">健診告訴你幾分，這支告訴你怎麼補。</strong>
              不是 AI 聊天——結構化勾選，給你可執行的下一步。
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8 space-y-6"
        >
          {/* 行業別 */}
          <div>
            <Label htmlFor="industry" className="text-sm font-semibold text-slate-900 mb-2 block">
              行業別 <span className="text-rose-500">*</span>
            </Label>
            <Select value={industry} onValueChange={(v) => { setIndustry(v); setError(''); }}>
              <SelectTrigger id="industry" className="h-12 text-base" aria-required="true">
                <SelectValue placeholder="選一個行業別" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 地區 */}
          <div>
            <Label htmlFor="city" className="text-sm font-semibold text-slate-900 mb-2 block">
              地區 <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setError(''); }}
              placeholder="例：台中西區 / 台北信義區"
              className="h-12 text-base"
              aria-required="true"
              maxLength={20}
            />
          </div>

          {/* 關鍵字（選填） */}
          <div>
            <Label htmlFor="keyword" className="text-sm font-semibold text-slate-900 mb-2 block">
              主要關鍵字 <span className="text-slate-500 font-normal text-xs">（選填）</span>
            </Label>
            <Input
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="例：台中 室內裝潢 / 信義區 牙醫"
              className="h-12 text-base"
              maxLength={30}
            />
          </div>

          {/* 現況自評：布林勾選 */}
          <fieldset className="pt-2">
            <legend className="text-sm font-semibold text-slate-900 mb-1">
              你目前的現況
            </legend>
            <p className="text-xs text-slate-500 mb-3">勾選「已經做到」的項目，沒勾的會進你的待辦清單。</p>
            <div className="space-y-2">
              {BOOLEAN_CHECKS.map(({ key, label }) => {
                const on = !!checks[key];
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => toggle(key)}
                    aria-pressed={on}
                    className={[
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                      on
                        ? 'bg-[#E1F5EE] border-[#1D9E75] text-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex items-center justify-center w-5 h-5 rounded-md border shrink-0',
                        on ? 'bg-[#1D9E75] border-[#1D9E75]' : 'bg-white border-slate-300',
                      ].join(' ')}
                      aria-hidden
                    >
                      {on && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 照片數量 */}
          <SegmentedField
            label="商家照片數量"
            options={PHOTO_LEVELS}
            value={photoCount}
            onChange={(v) => setPhotoCount(v as PhotoLevel)}
          />

          {/* 評論數量 */}
          <SegmentedField
            label="目前的評論則數"
            options={REVIEW_LEVELS}
            value={reviewCount}
            onChange={(v) => setReviewCount(v as ReviewLevel)}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
            data-gtm-event="map_visibility_generate"
          >
            <MapPinned className="w-4 h-4 mr-2" aria-hidden />
            產生我的地圖優化清單
          </Button>

          {error && (
            <p role="alert" className="text-sm text-rose-600 text-center">
              {error}
            </p>
          )}
        </form>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊
          </li>
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" aria-hidden /> 不抓店家資料
          </li>
          <li className="inline-flex items-center gap-2">
            <Gauge className="size-4 text-emerald-600" aria-hidden /> 30 秒出清單
          </li>
        </ul>
      </div>
    </section>
  );
}

function SegmentedField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-sm font-semibold text-slate-900 mb-2 block">{label}</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const on = value === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              role="radio"
              aria-checked={on}
              onClick={() => onChange(opt.value)}
              className={[
                'px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                on
                  ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
