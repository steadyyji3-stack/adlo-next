'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Download,
  AlertTriangle,
  MessageSquare,
  Mail,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import {
  buildQrCodeUrl,
  generateTemplates,
  validateReviewLink,
  type MessageTemplate,
  type TemplateChannel,
  type ValidatedReviewLink,
} from '@/lib/review-link';

interface Props {
  storeName: string;
  industry: string;
  reviewUrl: string;
  onReset: () => void;
}

const CHANNEL_META: Record<
  TemplateChannel,
  { icon: React.ComponentType<{ className?: string }>; label: string; tone: string }
> = {
  line: {
    icon: MessageSquare,
    label: 'LINE',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  card: {
    icon: CreditCard,
    label: '紙卡',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  email: {
    icon: Mail,
    label: 'Email',
    tone: 'bg-violet-50 text-violet-700 border-violet-200',
  },
};

function TemplateCard({ template }: { template: MessageTemplate }) {
  const [copied, setCopied] = useState(false);
  const meta = CHANNEL_META[template.channel];
  const Icon = meta.icon;

  function handleCopy() {
    navigator.clipboard.writeText(template.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <article className={`border rounded-xl p-4 md:p-5 ${meta.tone.split(' ').slice(-1)[0]}`}>
      <header className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.tone}`}>
            <Icon className="w-3 h-3" aria-hidden />
            {meta.label}
          </span>
          <span className="text-[11px] font-bold text-slate-700">{template.variant}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="text-xs h-7 gap-1.5"
          data-gtm-event="review_link_copy_template"
          aria-label={copied ? '已複製文案' : `複製 ${meta.label} ${template.variant}`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" aria-hidden /> 已複製
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" aria-hidden /> 複製
            </>
          )}
        </Button>
      </header>

      <p className="text-xs text-slate-500 mb-2.5">{template.description}</p>

      <pre className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-white/60 rounded-lg px-3 py-3 border border-slate-100">
        {template.body}
      </pre>

      {/* SR live region */}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? `${meta.label} ${template.variant} 已複製到剪貼簿` : ''}
      </span>
    </article>
  );
}

export default function ReviewLinkResults({ storeName, industry, reviewUrl, onReset }: Props) {
  const validated: ValidatedReviewLink = validateReviewLink(reviewUrl);
  const finalUrl = validated.url;
  const templates = generateTemplates({ storeName, industry, reviewUrl: finalUrl });
  const qrUrl = buildQrCodeUrl(finalUrl, 400);
  const qrLargeUrl = buildQrCodeUrl(finalUrl, 600);

  const [copiedUrl, setCopiedUrl] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(finalUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  }

  return (
    <section className="bg-slate-50 py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-8 md:mb-10 text-center">
          <Badge className="bg-[#1D9E75] text-white border-0 mb-4 px-3 py-1 text-xs font-extrabold tracking-wide">
            ✓ 全套素材就緒
          </Badge>
          <h2 className="font-extrabold text-slate-900 mb-2 leading-tight">
            <span className="block text-2xl sm:text-3xl md:text-4xl text-[#1D9E75]">{storeName}</span>
            <span className="block text-base sm:text-lg md:text-xl text-slate-700 mt-2">
              評論收集全套素材
            </span>
          </h2>
        </header>

        {/* 警告（如果 URL 不是最佳格式） */}
        {validated.warning && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
            <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
              {validated.warning}
            </p>
          </div>
        )}

        {/* QR Code 區塊 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-8 mb-8">
          <h3 className="text-base md:text-lg font-extrabold text-slate-900 mb-5">
            QR Code（印出來貼桌邊 / 結帳台 / 名片背面）
          </h3>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-md shrink-0">
              {/* 用 img 顯示 qrserver 產生的 QR PNG */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt={`${storeName} 的 Google 評論 QR Code`}
                width="200"
                height="200"
                className="block"
              />
            </div>
            <div className="flex-1 w-full">
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                掃了直接跳到 Google 評論編寫頁面，<strong>客人不用打字、不用搜尋、不用登入額外帳號</strong>（只要瀏覽器有登入 Google 帳號即可）。
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="default" size="sm" className="bg-[#1D9E75] hover:bg-[#168060]">
                  <a
                    href={qrLargeUrl}
                    download={`${storeName.replace(/\s+/g, '-')}-review-qr.png`}
                    data-gtm-event="review_link_download_qr"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" aria-hidden />
                    下載 PNG（600px）
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={finalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" aria-hidden />
                    測試連結
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyUrl}
                  aria-label={copiedUrl ? '已複製連結' : '複製評論連結'}
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" aria-hidden /> 已複製連結
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" aria-hidden /> 複製連結
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-400 break-all">
                {finalUrl}
              </p>
            </div>
          </div>
        </div>

        {/* 訊息模板 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 mb-8">
          <header className="mb-5">
            <h3 className="text-base md:text-lg font-extrabold text-slate-900">
              訊息模板 — 6 套（3 通路 × 2 風格）
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              每套都已套你的店名跟產業。複製、改一兩個字就能用。
            </p>
          </header>

          <div className="space-y-4">
            {templates.map((t) => (
              <TemplateCard key={`${t.channel}-${t.variant}`} template={t} />
            ))}
          </div>
        </div>

        {/* Reset CTA */}
        <div className="text-center mb-12">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="text-sm"
            data-gtm-event="review_link_reset"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" aria-hidden />
            換一家店再產一套
          </Button>
        </div>

        {/* 底部三推薦 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/check"
            aria-label="先測你的 GBP 健診分數"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="review_link_to_check"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 相關工具</div>
            <div className="font-bold text-slate-900 mb-1">先測 GBP 分數</div>
            <div className="text-xs text-slate-600 mb-3">評論回覆率是 GBP 六維度其一</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              GBP 健診 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/tools/post-writer"
            aria-label="生 7 天 GBP 貼文"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="review_link_to_post_writer"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 補上活躍訊號</div>
            <div className="font-bold text-slate-900 mb-1">貼文產生器</div>
            <div className="text-xs text-slate-600 mb-3">收評論同時也要持續發文，Google 才會推</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              產 7 天貼文 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/diagnostic"
            aria-label="預約評論回覆策略諮詢"
            className="group bg-white rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="review_link_to_diagnostic"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 想要專人協助</div>
            <div className="font-bold text-slate-900 mb-1">評論策略諮詢</div>
            <div className="text-xs text-slate-600 mb-3">從 0 累積到 100 則的 90 天路線圖</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              免費預約 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
