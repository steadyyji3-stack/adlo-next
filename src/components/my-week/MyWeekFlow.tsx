'use client';

import { useState, useSyncExternalStore } from 'react';
import { Sparkles, Shield, Clock } from 'lucide-react';
import MyWeekSetup from './MyWeekSetup';
import MyWeekResults from './MyWeekResults';
import {
  subscribeStoreProfile,
  getStoreProfileSnapshot,
  getStoreProfileServerSnapshot,
  saveStoreProfile,
  type StoreProfileInput,
} from '@/lib/store-profile';

export default function MyWeekFlow() {
  // 從外部 store（localStorage）同步讀取，免在 effect 裡 setState
  const profile = useSyncExternalStore(
    subscribeStoreProfile,
    getStoreProfileSnapshot,
    getStoreProfileServerSnapshot,
  );
  const [editing, setEditing] = useState(false);

  // SSR / 首幀 profile 一律 null（getServerSnapshot）→ 渲染 setup；
  // 客戶端有檔案時 useSyncExternalStore 會自動 re-render 成 view。
  const showSetup = editing || profile === null;

  function handleSave(input: StoreProfileInput) {
    saveStoreProfile(input);
    setEditing(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-14 sm:py-18 md:py-24">
        <div className="max-w-5xl mx-auto px-6 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            免費 · 存本機 · 每週回來只改一欄
          </div>
          <h1 className="text-[28px] sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.1]">
            存一次店家檔案，
            <br className="md:hidden" />
            <span className="text-[#1D9E75]">每週素材自動備好</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            設定一次店名 + 產業 + 標籤，之後每次進來，這週的 7 篇 GBP 貼文 + 7 篇 LINE 推播都幫你準備好。複製就能貼。
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <li className="inline-flex items-center gap-2">
              <Shield className="size-4 text-emerald-600" aria-hidden /> 檔案只存你的瀏覽器，不上傳
            </li>
            <li className="inline-flex items-center gap-2">
              <Clock className="size-4 text-emerald-600" aria-hidden /> 14 篇一次備好
            </li>
          </ul>
        </div>
      </section>

      {/* 內容 */}
      <section className="bg-slate-50 py-12 sm:py-16 px-6">
        {showSetup ? (
          <MyWeekSetup
            initial={profile}
            onSave={handleSave}
            onCancel={profile ? () => setEditing(false) : undefined}
          />
        ) : (
          <MyWeekResults profile={profile} onEdit={() => setEditing(true)} />
        )}
      </section>
    </>
  );
}
