import type { StoreProfile } from '@/lib/store-profile';
import { validateReviewLink } from '@/lib/review-link';

export interface CustomerInstantDeliverable {
  label: string;
  title: string;
  content: string;
  usage: string;
}

export function buildCustomerInstantDeliverable(input: {
  profile: StoreProfile;
  city?: string | null;
  signatureItems?: string[] | null;
  reviewUrl?: string | null;
}): CustomerInstantDeliverable {
  const storeName = input.profile.storeName.trim();
  const service = firstNonEmpty(input.signatureItems)
    ?? firstNonEmpty(input.profile.selectedTags)
    ?? `${input.profile.industry}服務`;
  const location = input.city?.trim();
  const audience = location ? `正在比較 ${location} ${service} 的人` : `正在比較 ${service} 的人`;
  const reviewDestination = reviewDestinationText(input.reviewUrl, storeName);

  return {
    label: '第一份完成品',
    title: '真實評論邀請訊息',
    content: `嗨，謝謝你最近選擇 ${storeName} 的${service}。\n\n如果方便，想請你花 1 分鐘在 Google 分享真實感受。可以寫下服務過程中最有感的一點，照實描述就可以，不用特別給高分。\n\n你的回饋會幫助${audience}更了解我們，謝謝你。\n\n${reviewDestination}`,
    usage: '傳給一位近期真實消費或完成服務的客人；不要群發，也不要提供好評交換條件。',
  };
}

function firstNonEmpty(values: string[] | null | undefined) {
  return values?.map((value) => value.trim()).find(Boolean) ?? null;
}

function reviewDestinationText(value: string | null | undefined, storeName: string) {
  if (!value) return `在 Google 地圖搜尋「${storeName}」即可留下評論。`;
  const validated = validateReviewLink(value);
  if (validated.type === 'g-page' || validated.type === 'writereview') {
    return validated.url;
  }
  if (validated.type === 'maps') {
    return `開啟 Google 地圖後，點「評論」即可分享：\n${validated.url}`;
  }
  return `在 Google 地圖搜尋「${storeName}」即可留下評論。`;
}
