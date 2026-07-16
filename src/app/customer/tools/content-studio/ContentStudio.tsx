'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Loader2, MapPin, MessageSquare, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CustomerContentBundle } from '@/lib/customer-content-types';

type Channel = 'gbp' | 'line';

export function ContentStudio({
  initialBundles,
  storeName,
}: {
  initialBundles: CustomerContentBundle[];
  storeName: string;
}) {
  const [bundles, setBundles] = useState(initialBundles);
  const [selectedId, setSelectedId] = useState(initialBundles[0]?.id ?? '');
  const [channel, setChannel] = useState<Channel>('gbp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'generating' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const selected = useMemo(
    () => bundles.find((bundle) => bundle.id === selectedId) ?? bundles[0] ?? null,
    [bundles, selectedId],
  );

  async function generateBundle() {
    setState('generating');
    setMessage('');
    try {
      const response = await fetch('/api/me/content-bundles', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setState('error');
        setMessage(data.error?.message ?? '產生失敗，請稍後再試');
        return;
      }

      const bundle = data.bundle as CustomerContentBundle;
      setBundles((current) => [
        bundle,
        ...current.filter((item) => item.id !== bundle.id && item.week_start !== bundle.week_start),
      ]);
      setSelectedId(bundle.id);
      setState('idle');
    } catch {
      setState('error');
      setMessage('網路錯誤，請稍後再試');
    }
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => current === key ? null : current), 1500);
    } catch {
      setMessage('無法使用剪貼簿，請手動選取文字');
      setState('error');
    }
  }

  const items = channel === 'gbp' ? selected?.gbp_posts ?? [] : selected?.line_broadcasts ?? [];

  return (
    <div>
      <section className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold text-[#0F6E56]">本週素材</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 md:text-3xl">{storeName}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {selected ? `${formatWeekRange(selected.week_start)} · 14 篇` : '尚未產生本週素材'}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {bundles.length > 0 && (
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span className="shrink-0">歷史週次</span>
              <select
                value={selected?.id ?? ''}
                onChange={(event) => setSelectedId(event.target.value)}
                className="h-10 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                {bundles.map((bundle) => (
                  <option key={bundle.id} value={bundle.id}>{formatWeekRange(bundle.week_start)}</option>
                ))}
              </select>
            </label>
          )}
          <Button
            type="button"
            onClick={generateBundle}
            disabled={state === 'generating'}
            className="h-10 bg-[#1D9E75] font-bold text-white hover:bg-[#168060]"
          >
            {state === 'generating' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            )}
            {selected && isCurrentWeek(selected.week_start) ? '更新本週素材' : '產生本週素材'}
          </Button>
        </div>
      </section>

      {state === 'error' && (
        <div role="alert" className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {message}
        </div>
      )}

      {selected ? (
        <>
          <div className="my-6 inline-flex h-11 rounded-md bg-slate-200/70 p-1" role="group" aria-label="素材通路">
            <ChannelButton active={channel === 'gbp'} onClick={() => setChannel('gbp')} icon={MapPin}>
              GBP 貼文 · 7
            </ChannelButton>
            <ChannelButton active={channel === 'line'} onClick={() => setChannel('line')} icon={MessageSquare}>
              LINE 推播 · 7
            </ChannelButton>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {items.map((item, index) => {
              const key = `${channel}-${selected.id}-${index}`;
              const content = 'content' in item ? item.content : item.message;
              return (
                <article key={key} className="grid gap-4 px-4 py-5 sm:grid-cols-[120px_minmax(0,1fr)_44px] sm:px-5">
                  <div>
                    <p className="font-extrabold text-slate-900">{item.day}</p>
                    <Badge variant="outline" className="mt-2 border-emerald-200 bg-emerald-50 text-emerald-700">
                      {item.category}
                    </Badge>
                    <p className="mt-2 text-xs text-slate-400">{item.bestTime}</p>
                  </div>
                  <div className="min-w-0">
                    {'title' in item && item.title && (
                      <h2 className="text-sm font-extrabold text-slate-900">{item.title}</h2>
                    )}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{content}</p>
                    {'imageHint' in item && (
                      <p className="mt-3 text-xs text-slate-400">圖片：{item.imageHint}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={copiedKey === key ? '已複製' : '複製內容'}
                    aria-label={copiedKey === key ? '已複製' : `複製${item.day}內容`}
                    onClick={() => copy(content, key)}
                    className="h-10 w-10 justify-self-end text-slate-500 hover:text-[#0F6E56]"
                  >
                    {copiedKey === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="border-b border-slate-200 py-20 text-center">
          <p className="text-sm font-semibold text-slate-500">產生後，14 篇素材會保存在這裡。</p>
        </div>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {copiedKey ? '已複製到剪貼簿' : ''}
      </div>
    </div>
  );
}

function ChannelButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        'inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-bold transition-colors',
        active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800',
      ].join(' ')}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {children}
    </button>
  );
}

function formatWeekRange(value: string) {
  const start = new Date(`${value}T00:00:00+08:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.getMonth() + 1}/${start.getDate()}–${end.getMonth() + 1}/${end.getDate()}`;
}

function isCurrentWeek(value: string) {
  const now = new Date();
  const taipei = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const daysSinceMonday = (taipei.getUTCDay() + 6) % 7;
  taipei.setUTCDate(taipei.getUTCDate() - daysSinceMonday);
  return taipei.toISOString().slice(0, 10) === value;
}
