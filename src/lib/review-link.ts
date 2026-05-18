/**
 * /tools/review-link 核心邏輯
 *
 * 用戶責任：自己從 Google Business Profile 拿到「索取更多評論」短連結
 * （g.page format），我們驗證 + 生 QR + 生模板。
 *
 * 不打 Places API（不消耗 cost-cap 預算）。
 */

export type ReviewLinkType = 'g-page' | 'writereview' | 'maps' | 'unknown' | 'invalid';

export interface ValidatedReviewLink {
  type: ReviewLinkType;
  url: string; // 標準化後的 URL
  warning?: string; // 若不是最佳格式，提示
}

/**
 * 驗證 + 分類 review URL。
 * 接受：
 *   - g.page format: https://g.page/r/{shortcode}/review
 *   - writereview: https://search.google.com/local/writereview?placeid=...
 *   - Google Maps: https://maps.google.com/... (不推薦但接受)
 *   - 短連結：https://goo.gl/maps/... or https://maps.app.goo.gl/...
 */
export function validateReviewLink(raw: string): ValidatedReviewLink {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { type: 'invalid', url: '', warning: '請輸入評論連結' };

  let url: URL;
  try {
    // 自動補 https://
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    url = new URL(withProtocol);
  } catch {
    return { type: 'invalid', url: trimmed, warning: '不是有效 URL' };
  }

  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  // 1. g.page review link（最理想）
  if (host === 'g.page') {
    if (/\/r\/[^/]+\/review/i.test(path)) {
      return { type: 'g-page', url: url.toString() };
    }
    return {
      type: 'g-page',
      url: url.toString(),
      warning: '這個 g.page 連結看起來不是 review 編寫連結。請從 Google Business Profile 找「索取更多評論」按鈕。',
    };
  }

  // 2. 標準 writereview 連結
  if (host === 'search.google.com' && path.includes('/local/writereview')) {
    return { type: 'writereview', url: url.toString() };
  }

  // 3. Google Maps 短連結
  if (host === 'maps.app.goo.gl' || host === 'goo.gl') {
    return {
      type: 'maps',
      url: url.toString(),
      warning: '這是 Google 地圖短連結，會打開地圖頁而不是評論編寫頁。建議改用 g.page 評論連結（從 Google Business Profile 索取）。',
    };
  }

  // 4. Google Maps 完整 URL
  if (host.includes('google.com') && path.includes('/maps')) {
    return {
      type: 'maps',
      url: url.toString(),
      warning: '這是地圖頁面連結，會帶客人到地圖頁而不是直接到評論編寫畫面。建議改用 g.page 評論連結。',
    };
  }

  return {
    type: 'unknown',
    url: url.toString(),
    warning: '無法識別這個連結是否為 Google 評論連結。QR Code 仍會生成，但建議檢查連結是否正確。',
  };
}

/**
 * 產生 QR Code 圖片 URL。
 * 用 qrserver.com 公開免費 API，不需 key。
 */
export function buildQrCodeUrl(targetUrl: string, size: 200 | 400 | 600 = 400): string {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: targetUrl,
    margin: '10',
    color: '0F172A', // slate-900
    bgcolor: 'FFFFFF',
    format: 'png',
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

// ────────────────────────────────────────────────
// 訊息模板
// ────────────────────────────────────────────────
export type TemplateChannel = 'line' | 'card' | 'email';

export interface MessageTemplate {
  channel: TemplateChannel;
  label: string;
  variant: string; // A / B
  description: string;
  body: string;
}

export interface TemplateInput {
  storeName: string;
  industry: string; // 例：餐廳、髮廊、診所
  reviewUrl: string;
}

export function generateTemplates(input: TemplateInput): MessageTemplate[] {
  const { storeName, industry, reviewUrl } = input;
  const name = storeName.trim() || '我們';
  const ind = industry.trim() || '本店';

  return [
    // ─── LINE ───
    {
      channel: 'line',
      label: 'LINE 訊息',
      variant: 'A · 親切感謝',
      description: '結帳後或服務結束 30 分鐘內傳，效果最好',
      body: `謝謝你今天來 ${name} 😊

我們的小店正在累積真實評論，
你的一句話對我們超有幫助。

不用太長，三五句就夠：
${reviewUrl}

寫好我們會看到，下次來再請你喝杯飲料 ☕️`,
    },
    {
      channel: 'line',
      label: 'LINE 訊息',
      variant: 'B · 簡短直球',
      description: '熟客或忙碌客人適用，60 秒內讀完',
      body: `${name} 在收集評論
👇 點這寫一下
${reviewUrl}

謝啦 🙏`,
    },

    // ─── 桌卡 / 紙本 ───
    {
      channel: 'card',
      label: '桌卡 / 紙本',
      variant: 'A · 結帳台版',
      description: '貼結帳台、桌邊立卡、收據背面',
      body: `謝謝你光臨 ${name}

如果今天的${ind}讓你滿意，
願意花 30 秒幫我們寫個 Google 評論嗎？

掃 QR Code → 直接寫
（不用註冊，輸入幾句話就好）

對小店家來說，你的一句話勝過十個廣告。`,
    },
    {
      channel: 'card',
      label: '桌卡 / 紙本',
      variant: 'B · 餐後遞給客人',
      description: '結完帳遞給客人時用',
      body: `${name} 邀請你

把今天用餐/服務的心得寫成 Google 評論
↓ 掃這裡，30 秒搞定 ↓

（誠實寫就好，不用美化）`,
    },

    // ─── Email ───
    {
      channel: 'email',
      label: 'Email 信件',
      variant: 'A · 服務後追蹤',
      description: '客人離開 1-3 天內寄，最自然',
      body: `主旨：謝謝你前幾天來 ${name} 🙏

${name} 的客人您好，

我們翻了一下訂位紀錄，看到您前幾天有來。
不知道${ind}體驗還滿意嗎？

如果有讓您覺得不錯的地方，
能不能花 30 秒寫個 Google 評論？
${reviewUrl}

對我們這種小店家來說，
您的一句話比任何廣告都珍貴。

如果有讓您不滿意的，
也直接回信告訴我們，我們會立刻改進。

謝謝您 🙏

—— ${name}`,
    },
    {
      channel: 'email',
      label: 'Email 信件',
      variant: 'B · 預約客專用',
      description: '預約系統內建追蹤信，自動化排程',
      body: `主旨：${name} - 你的回饋幫我們很大

您好，

謝謝預約並光臨 ${name}。

我們在累積真實的客戶回饋，作為改進方向。
如果方便，請花 30 秒寫個 Google 評論：

${reviewUrl}

無論滿意或不滿意，誠實的內容對我們都是寶藏。

—— ${name}`,
    },
  ];
}

// ────────────────────────────────────────────────
// 教學內容（如何找到正確的 g.page 評論連結）
// ────────────────────────────────────────────────
export const HOW_TO_FIND_REVIEW_LINK: { step: number; title: string; body: string }[] = [
  {
    step: 1,
    title: '登入 Google Business Profile',
    body: '到 business.google.com 用你的 Google 帳號登入（必須是商家擁有者帳號）',
  },
  {
    step: 2,
    title: '找「索取更多評論」',
    body: '進入商家後台，左側選單找「請求評論」或主畫面卡片的「分享評論表單」按鈕',
  },
  {
    step: 3,
    title: '複製顯示的短連結',
    body: '會看到一個 g.page/r/.../review 開頭的短連結 — 這就是「直達評論編寫畫面」的連結',
  },
  {
    step: 4,
    title: '貼回本工具',
    body: '把那條連結貼進上面的輸入框，我們會驗證、生 QR、產出訊息模板',
  },
];
