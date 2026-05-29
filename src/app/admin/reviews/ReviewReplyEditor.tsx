'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { GbpReviewReplyStatus } from '@/lib/gbp-reviews';

export function ReviewReplyEditor({
  reviewId,
  initialReply,
  initialStatus,
}: {
  reviewId: string;
  initialReply: string | null;
  initialStatus: GbpReviewReplyStatus | null;
}) {
  const router = useRouter();
  const [replyText, setReplyText] = useState(initialReply ?? '');
  const [replyStatus, setReplyStatus] = useState<GbpReviewReplyStatus>(initialStatus ?? 'pending');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function saveReply() {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          reply_text: replyText.trim() || null,
          reply_status: replyStatus,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '儲存回覆草稿失敗');
        return;
      }
      router.refresh();
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-w-[320px] flex-col gap-3">
      <Textarea
        value={replyText}
        onChange={(event) => setReplyText(event.target.value)}
        placeholder="輸入評論回覆草稿"
        maxLength={1500}
        className="min-h-24 resize-none text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={replyStatus} onValueChange={(value) => setReplyStatus(value as GbpReviewReplyStatus)}>
          <SelectTrigger className="h-9 w-28 bg-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">待回覆</SelectItem>
            <SelectItem value="drafted">已草稿</SelectItem>
            <SelectItem value="posted">已發布</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" size="sm" onClick={saveReply} disabled={saving} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
          {saving ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <Save data-icon="inline-start" aria-hidden />}
          儲存
        </Button>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  );
}
