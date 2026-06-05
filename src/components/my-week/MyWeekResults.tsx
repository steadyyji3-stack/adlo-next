'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Pencil, MessageSquare, MapPin } from 'lucide-react';
import Link from 'next/link';
import { generatePosts } from '@/lib/gbp-post-writer';
import { generateBroadcasts } from '@/lib/line-broadcast';
import type { StoreProfile } from '@/lib/store-profile';

interface Props {
  profile: StoreProfile;
  onEdit: () => void;
}

type Channel = 'gbp' | 'line';

export default function MyWeekResults({ profile, onEdit }: Props) {
  const [channel, setChannel] = useState<Channel>('gbp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const posts = useMemo(
    () =>
      generatePosts({
        storeName: profile.storeName,
        industry: profile.industry,
        weekTheme: profile.weekTheme,
        selectedTags: profile.selectedTags,
      }),
    [profile],
  );

  const broadcasts = useMemo(
    () =>
      generateBroadcasts({
        storeName: profile.storeName,
        industry: profile.industry,
        weekTheme: profile.weekTheme,
        selectedTags: profile.selectedTags,
      }),
    [profile],
  );

  async function copy(text: string, key: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
      }
    } catch (err) {
      console.error('[my-week] copy failed', err);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 檔案摘要列 */}
      <div className="flex flex-wrap items-center gap-3 justify-between bg-white rounded-2xl ring-1 ring-slate-200 p-5 mb-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-700 mb-0.5">我的店家檔案</p>
          <p className="font-bold text-slate-900 truncate">
            {profile.storeName}
            <span className="text-slate-400 font-normal ml-2 text-sm">{profile.industry}</span>
          </p>
          {profile.selectedTags.length > 0 && (
            <p className="text-xs text-slate-500 mt-1 truncate">
              {profile.selectedTags.join('、')}
            </p>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onEdit} className="text-xs shrink-0">
          <Pencil className="w-3.5 h-3.5 mr-1.5" aria-hidden />
          編輯檔案
        </Button>
      </div>

      {/* 通路切換（toggle 群組） */}
      <div
        role="group"
        aria-label="選擇素材通路"
        className="inline-flex rounded-xl bg-slate-100 p-1 mb-6"
      >
        <button
          type="button"
          aria-pressed={channel === 'gbp'}
          onClick={() => setChannel('gbp')}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            channel === 'gbp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
          ].join(' ')}
        >
          <MapPin className="w-4 h-4" aria-hidden />
          GBP 貼文 · 7 篇
        </button>
        <button
          type="button"
          aria-pressed={channel === 'line'}
          onClick={() => setChannel('line')}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            channel === 'line' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
          ].join(' ')}
        >
          <MessageSquare className="w-4 h-4" aria-hidden />
          LINE 推播 · 7 篇
        </button>
      </div>

      {/* GBP 貼文 */}
      {channel === 'gbp' && (
        <div className="space-y-4">
          {posts.map((p, idx) => {
            const key = `gbp-${idx}`;
            return (
              <article key={key} className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-bold text-slate-900 text-base">{p.day}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs font-bold">
                    {p.category}
                  </Badge>
                  <span className="text-xs text-slate-500 ml-auto">建議 {p.bestTime}</span>
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-2">{p.title}</p>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 bg-slate-50 rounded-lg p-4 mb-3 ring-1 ring-slate-200">
                  {p.content}
                </pre>
                <p className="text-xs text-slate-400 mb-3">📷 {p.imageHint}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(p.content, key)}
                  className="text-xs"
                  aria-label={`複製 ${p.day} ${p.category} 貼文`}
                >
                  {copiedKey === key
                    ? <><Check className="w-3.5 h-3.5 mr-1.5" aria-hidden />已複製</>
                    : <><Copy className="w-3.5 h-3.5 mr-1.5" aria-hidden />複製這篇</>}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {/* LINE 推播 */}
      {channel === 'line' && (
        <div className="space-y-4">
          {broadcasts.map((b, idx) => {
            const key = `line-${idx}`;
            return (
              <article key={key} className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-bold text-slate-900 text-base">{b.day}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs font-bold">
                    {b.category}
                  </Badge>
                  <span className="text-xs text-slate-500 ml-auto">
                    {b.characterCount} 字 · 建議 {b.bestTime}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 bg-slate-50 rounded-lg p-4 mb-3 ring-1 ring-slate-200">
                  {b.message}
                </pre>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(b.message, key)}
                  className="text-xs"
                  aria-label={`複製 ${b.day} ${b.category} 推播`}
                >
                  {copiedKey === key
                    ? <><Check className="w-3.5 h-3.5 mr-1.5" aria-hidden />已複製</>
                    : <><Copy className="w-3.5 h-3.5 mr-1.5" aria-hidden />複製這篇</>}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {/* 螢幕閱讀器複製公告 */}
      <div role="status" aria-live="polite" className="sr-only">
        {copiedKey ? '已複製到剪貼簿' : ''}
      </div>

      {/* footer 提示 */}
      <div className="mt-10 bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-700 leading-relaxed">
          這 14 篇是依你的店家檔案產的。下週回來，改一下「本週主題」就能換一輪——
          其他不用重填。
        </p>
        <p className="mt-3 text-xs text-slate-500">
          想看 Google 商家現在幾分？
          <Link href="/check" className="text-emerald-700 font-semibold hover:underline ml-1">
            做個 GBP 健檢 →
          </Link>
        </p>
      </div>
    </div>
  );
}
