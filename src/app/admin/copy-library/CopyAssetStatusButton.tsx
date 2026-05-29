'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Archive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CopyAssetStatus } from '@/lib/copy-assets';

export function CopyAssetStatusButton({
  assetId,
  status,
  label,
}: {
  assetId: string;
  status: CopyAssetStatus;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/copy-library/${assetId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const Icon = status === 'approved' ? CheckCircle2 : Archive;

  return (
    <Button type="button" size="sm" variant="outline" onClick={updateStatus} disabled={loading}>
      {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <Icon data-icon="inline-start" aria-hidden />}
      {label}
    </Button>
  );
}
