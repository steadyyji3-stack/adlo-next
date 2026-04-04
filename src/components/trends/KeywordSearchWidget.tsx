'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const suggestions = [
  '台北牙醫', '附近餐廳', '信義區咖啡廳', '台中美髮', '高雄診所推薦',
  '到府清潔', '水電工推薦', '寵物美容 台北',
];

export default function KeywordSearchWidget() {
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('台北牙醫');
  const [loading, setLoading] = useState(false);

  const iframeSrc = (() => {
    const req = JSON.stringify({
      comparisonItem: [{ keyword, geo: 'TW', time: 'today 12-m' }],
      category: 0,
      property: '',
    });
    const eq = `q=${encodeURIComponent(keyword)}&geo=TW&date=today%2012-m`;
    return `https://trends.google.com/trends/embed/explore/TIMESERIES?req=${encodeURIComponent(req)}&tz=-480&eq=${eq}`;
  })();

  function handleSearch(kw?: string) {
    const q = (kw ?? input).trim();
    if (!q) return;
    setLoading(true);
    setKeyword(q);
    setTimeout(() => setLoading(false), 1200);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Search bar */}
      <div className="p-6 border-b border-slate-100 bg-[#E1F5EE]/40">
        <p className="text-sm font-semibold text-slate-600 mb-3">輸入你的行業或服務關鍵字，查看台灣搜尋趨勢：</p>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="例如：台北美髮、附近診所、信義區餐廳…"
            className="flex-1 border-slate-200 focus-visible:ring-[#1D9E75]"
          />
          <Button
            onClick={() => handleSearch()}
            className="cta-gradient text-white shrink-0 px-5"
          >
            <Search className="w-4 h-4 mr-1.5" />
            查看趨勢
          </Button>
        </div>
        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => { setInput(s); handleSearch(s); }}
              className="text-xs px-3 py-1 rounded-full border border-[#1D9E75]/30 bg-white text-[#0F6E56] hover:bg-[#1D9E75] hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result header */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">
          關鍵字：<span className="text-[#1D9E75]">「{keyword}」</span>
        </span>
        <Badge variant="outline" className="text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] text-xs">
          台灣 · 過去 12 個月
        </Badge>
      </div>

      {/* Trends iframe */}
      <div className="relative bg-white" style={{ height: 380 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="w-6 h-6 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          key={keyword}
          src={iframeSrc}
          className="w-full h-full border-0"
          loading="lazy"
          title={`Google Trends: ${keyword}`}
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500">
          看到你的關鍵字熱度了嗎？
          <a href="/contact" className="text-[#1D9E75] font-semibold ml-1 hover:underline">
            讓 adlo 幫你搶佔這個搜尋流量 →
          </a>
        </p>
      </div>
    </div>
  );
}
