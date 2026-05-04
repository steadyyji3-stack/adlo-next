'use client';

import { useState, FormEvent } from 'react';
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
import { Radar, Shield, Clock, UserX } from 'lucide-react';
import CompetitorIllustration from './CompetitorIllustration';
import type { City, CompetitorInput } from './mock-data';

interface Props {
  onSubmit: (input: CompetitorInput) => void;
  errorMsg?: string | null;
}

const CITIES: City[] = ['台北', '新北', '桃園', '台中', '台南', '高雄', '基隆', '新竹', '其他'];

export default function CompetitorHero({ onSubmit, errorMsg }: Props) {
  const [storeName, setStoreName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState<City | ''>('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (storeName.trim().length < 2) return setError('店名至少 2 個字');
    if (keyword.trim().length < 2) return setError('關鍵字至少 2 個字（例：早午餐、剪髮）');
    if (!city) return setError('請選擇城市');
    setError('');
    onSubmit({
      storeName: storeName.trim(),
      keyword: keyword.trim(),
      city: city as City,
    });
  }

  const displayError = error || errorMsg || '';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-28 lg:py-32">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <CompetitorIllustration />

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            免費 · 不用註冊 · 30 秒看完
          </div>

          <h1 className="text-[32px] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            你 vs 同區 3 家，
            <br className="md:hidden" />
            <span className="text-[#1D9E75]">一張雷達圖</span>看清。
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-slate-900">用 Google 地圖真實搜尋結果</strong>抓出同區同類前 3 家。
            做六維度比較，告訴你哪裡領先、哪裡落後。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8"
        >
          <div className="space-y-5">
            <div>
              <Label htmlFor="store-name" className="text-sm font-semibold text-slate-900 mb-2 block">
                你的店名（Google 地圖完整名稱）<span className="text-rose-500">*</span>
              </Label>
              <Input
                id="store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="例：LE BANHMI 樂粄米 敦北店"
                className="h-12 text-base"
                aria-required="true"
                aria-describedby="store-name-help"
              />
              <p id="store-name-help" className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                請打開 Google 地圖查你的店，<strong>複製顯示的完整店名</strong>。
                少一個字就找不到。
              </p>
            </div>

            <div>
              <Label htmlFor="keyword" className="text-sm font-semibold text-slate-900 mb-2 block">
                想打的關鍵字 <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="例：早午餐、剪髮、植牙"
                className="h-12 text-base"
                aria-required="true"
              />
            </div>

            <div>
              <Label htmlFor="city" className="text-sm font-semibold text-slate-900 mb-2 block">
                所在城市 <span className="text-rose-500">*</span>
              </Label>
              <Select value={city} onValueChange={(v) => setCity(v as City)}>
                <SelectTrigger id="city" className="h-12 text-base" aria-required="true">
                  <SelectValue placeholder="選一個" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
              data-gtm-event="competitor_analyze"
            >
              <Radar className="w-4 h-4 mr-2" aria-hidden />
              產出雷達比較圖
            </Button>

            {displayError && (
              <p role="alert" className="text-sm text-rose-600 text-center">{displayError}</p>
            )}
          </div>
        </form>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2"><UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊</li>
          <li className="inline-flex items-center gap-2"><Shield className="size-4 text-emerald-600" aria-hidden /> 不抓店家資料</li>
          <li className="inline-flex items-center gap-2"><Clock className="size-4 text-emerald-600" aria-hidden /> 30 秒出結果</li>
        </ul>
      </div>
    </section>
  );
}
