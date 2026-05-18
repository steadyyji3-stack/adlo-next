'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GbpPostStatus } from '@/lib/gbp-posts';

export function PostStatusSelect({ postId, status }: { postId: string; status: GbpPostStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function updateStatus(nextStatus: GbpPostStatus) {
    setValue(nextStatus);
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) setValue(status);
      router.refresh();
    } catch {
      setValue(status);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onValueChange={(next) => updateStatus(next as GbpPostStatus)} disabled={saving}>
      <SelectTrigger className="h-9 w-28 bg-white text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">草稿</SelectItem>
        <SelectItem value="scheduled">已排程</SelectItem>
        <SelectItem value="posted">已發布</SelectItem>
        <SelectItem value="failed">失敗</SelectItem>
      </SelectContent>
    </Select>
  );
}
