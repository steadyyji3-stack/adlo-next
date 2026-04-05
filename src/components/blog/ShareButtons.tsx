'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const platforms = [
    {
      name: 'X (Twitter)',
      icon: 'simple-icons:x',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      bg: 'hover:bg-black hover:text-white',
    },
    {
      name: 'Facebook',
      icon: 'simple-icons:facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      bg: 'hover:bg-[#1877F2] hover:text-white',
    },
    {
      name: 'LINE',
      icon: 'simple-icons:line',
      href: `https://social-plugins.line.me/lineit/share?url=${encoded}`,
      bg: 'hover:bg-[#00B900] hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: 'simple-icons:linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      bg: 'hover:bg-[#0A66C2] hover:text-white',
    },
  ];

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <span className="text-sm font-semibold text-slate-600 shrink-0 flex items-center gap-1.5">
        <Share2 className="w-4 h-4" /> 分享這篇文章
      </span>
      <div className="flex flex-wrap gap-2">
        {platforms.map(p => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`分享到 ${p.name}`}
            className={`w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 transition-all ${p.bg}`}
          >
            <Icon icon={p.icon} width={16} />
          </a>
        ))}
        <button
          onClick={copyLink}
          title="複製連結"
          className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
