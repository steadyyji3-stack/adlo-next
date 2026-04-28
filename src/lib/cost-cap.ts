import 'server-only';
import { Redis } from '@upstash/redis';

/**
 * /check 工具的「總量保命層」。
 *
 * Lorenzo 政策（2026-04-28）：
 * - Places API 每月最多 $10 USD 自付額度
 * - 計算：searchText $0.032 + 條件性競品搜尋 ≈ $0.04/call → 250 次/月
 * - 日均 8.3 次，但容許尖峰 → 日上限 40 次（4.8x daily average）
 *
 * 這層是在現有 IP 速率限制（3/日 +email 10/日）之上的「全站總和」保險。
 * 即使攻擊者輪換 IP / 提交不同 email，也擋不過全站日/月計數器。
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── Tunables ────────────────────────────────────────────────────────────
const COST_PER_CALL_USD = 0.04; // 平均 searchText + 條件性 nearby (Places API New)
const MONTHLY_BUDGET_USD = 10;
const MAX_CALLS_PER_MONTH = Math.floor(MONTHLY_BUDGET_USD / COST_PER_CALL_USD); // 250
const MAX_CALLS_PER_DAY = 40; // ~5x daily-average，容許 launch day 尖峰
const MAX_BURST_PER_IP_PER_MIN = 5;

// 明顯的非瀏覽器 User-Agent（自動化工具預設值）
const SUSPICIOUS_UA_PATTERNS = [
  /^$/,
  /\bcurl\b/i,
  /\bwget\b/i,
  /\bpython-requests\b/i,
  /\baxios\b/i,
  /\bgo-http-client\b/i,
  /\bjava-http-client\b/i,
  /\bokhttp\b/i,
  /\bbot\b/i,
  /\bcrawler\b/i,
  /\bspider\b/i,
  /\bheadless/i,
  /\bphantomjs\b/i,
];

// ── Types ───────────────────────────────────────────────────────────────
export type CostCapReason =
  | 'BOT_UA'
  | 'IP_BURST'
  | 'GLOBAL_DAILY'
  | 'GLOBAL_MONTHLY';

export interface CostCapResult {
  allowed: boolean;
  reason?: CostCapReason;
  message?: string;
  /** 用於監控；不回給用戶 */
  stats?: {
    burstCount: number;
    dailyCount: number;
    monthlyCount: number;
    monthlyLimit: number;
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────
function todayISO(): string {
  // 用 Asia/Taipei 為基準，避免 UTC 跨日干擾用戶體驗
  const now = new Date();
  const tw = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return tw.toISOString().slice(0, 10); // YYYY-MM-DD
}

function currentMonth(): string {
  const now = new Date();
  const tw = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return tw.toISOString().slice(0, 7); // YYYY-MM
}

function normalizeIp(ip: string): string {
  return ip.replace(/[^\d.:a-fA-F]/g, '').slice(0, 64) || 'unknown';
}

function isSuspiciousUA(ua: string): boolean {
  return SUSPICIOUS_UA_PATTERNS.some((re) => re.test(ua));
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Pre-flight check：在呼叫 Places API 之前跑。
 * 順序：UA → burst → 全站日 → 全站月。最便宜的先擋。
 */
export async function checkCostCap(
  ip: string,
  userAgent: string,
): Promise<CostCapResult> {
  const normIp = normalizeIp(ip);

  // 1. UA filter（0 cost）
  if (isSuspiciousUA(userAgent ?? '')) {
    console.warn('[cost-cap] BOT_UA blocked', { ip: normIp, ua: userAgent });
    return {
      allowed: false,
      reason: 'BOT_UA',
      message: '偵測到自動化請求，請從一般瀏覽器使用',
    };
  }

  // 2. Burst per IP (1 min)
  const minuteSlot = Math.floor(Date.now() / 60000);
  const burstKey = `adlo:check:burst:${normIp}:${minuteSlot}`;

  let burstCount: number;
  try {
    burstCount = await redis.incr(burstKey);
    if (burstCount === 1) {
      await redis.expire(burstKey, 120); // 2 分鐘 TTL（容錯）
    }
  } catch (err) {
    console.error('[cost-cap] burst check Redis 失敗，放行', err);
    burstCount = 0;
  }

  if (burstCount > MAX_BURST_PER_IP_PER_MIN) {
    console.warn('[cost-cap] IP_BURST blocked', {
      ip: normIp,
      count: burstCount,
    });
    return {
      allowed: false,
      reason: 'IP_BURST',
      message: '請求過於頻繁，請等 1 分鐘再試',
    };
  }

  // 3. Global daily cap（最重要的保命）
  const dayKey = `adlo:check:global:daily:${todayISO()}`;
  let dailyCount = 0;
  try {
    dailyCount = (await redis.get<number>(dayKey)) ?? 0;
  } catch (err) {
    console.error('[cost-cap] daily get 失敗，放行', err);
  }

  if (dailyCount >= MAX_CALLS_PER_DAY) {
    console.warn('[cost-cap] GLOBAL_DAILY hit', { count: dailyCount });
    return {
      allowed: false,
      reason: 'GLOBAL_DAILY',
      message: '今日全站健檢額度已用完，請明天再試',
    };
  }

  // 4. Global monthly cap（$10 USD 硬上限）
  const monthKey = `adlo:check:global:monthly:${currentMonth()}`;
  let monthlyCount = 0;
  try {
    monthlyCount = (await redis.get<number>(monthKey)) ?? 0;
  } catch (err) {
    console.error('[cost-cap] monthly get 失敗，放行', err);
  }

  if (monthlyCount >= MAX_CALLS_PER_MONTH) {
    console.warn('[cost-cap] GLOBAL_MONTHLY hit', { count: monthlyCount });
    return {
      allowed: false,
      reason: 'GLOBAL_MONTHLY',
      message: '本月健檢服務額度已用完，下個月 1 號自動恢復',
    };
  }

  return {
    allowed: true,
    stats: {
      burstCount,
      dailyCount,
      monthlyCount,
      monthlyLimit: MAX_CALLS_PER_MONTH,
    },
  };
}

/**
 * 在成功呼叫 Places API 後遞增全站計數器。
 * 失敗（如 Places API throw）不應呼叫此函式，避免高估用量。
 */
export async function incrementCostCap(): Promise<void> {
  const dayKey = `adlo:check:global:daily:${todayISO()}`;
  const monthKey = `adlo:check:global:monthly:${currentMonth()}`;

  try {
    const [d, m] = await Promise.all([redis.incr(dayKey), redis.incr(monthKey)]);
    // 設 TTL（避免無限累加 + 跨期殘留）
    if (d === 1) await redis.expire(dayKey, 60 * 60 * 25); // 25h 緩衝
    if (m === 1) await redis.expire(monthKey, 60 * 60 * 24 * 32); // 32d 緩衝

    // 80%/100% 警示 log（之後可串 webhook 通知 Lorenzo）
    if (m >= MAX_CALLS_PER_MONTH) {
      console.error('[cost-cap] 🚨 月上限已達', { count: m, limit: MAX_CALLS_PER_MONTH });
    } else if (m >= MAX_CALLS_PER_MONTH * 0.8) {
      console.warn('[cost-cap] ⚠️ 月用量已達 80%', { count: m, limit: MAX_CALLS_PER_MONTH });
    }
  } catch (err) {
    console.error('[cost-cap] increment 失敗（忽略）', err);
  }
}

/** 給管理頁/監控用：當前用量快照 */
export async function getCostCapStats(): Promise<{
  daily: number;
  dailyLimit: number;
  monthly: number;
  monthlyLimit: number;
  monthlyBudgetUsd: number;
  estimatedCostUsd: number;
}> {
  const dayKey = `adlo:check:global:daily:${todayISO()}`;
  const monthKey = `adlo:check:global:monthly:${currentMonth()}`;

  const [daily, monthly] = await Promise.all([
    redis.get<number>(dayKey).catch(() => 0),
    redis.get<number>(monthKey).catch(() => 0),
  ]);

  return {
    daily: daily ?? 0,
    dailyLimit: MAX_CALLS_PER_DAY,
    monthly: monthly ?? 0,
    monthlyLimit: MAX_CALLS_PER_MONTH,
    monthlyBudgetUsd: MONTHLY_BUDGET_USD,
    estimatedCostUsd: Number(((monthly ?? 0) * COST_PER_CALL_USD).toFixed(2)),
  };
}
