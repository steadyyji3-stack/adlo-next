import type { StoreProfile } from '@/lib/store-profile';
import type {
  CustomerGrowthCycle,
  GrowthBaselineSnapshot,
  GrowthBusinessContext,
  GrowthConfidenceLevel,
  GrowthNextRecommendation,
  GrowthOutcomeEvidence,
  GrowthOutcomeStatus,
  GrowthResultSnapshot,
  GrowthTask,
  GrowthVerificationPlan,
} from '@/lib/customer-growth-types';

const MAX_METRIC_VALUE = 1_000_000;

export function verificationPlanForTask(task: GrowthTask): GrowthVerificationPlan {
  if (task.verification) return task.verification;

  return defaultVerificationPlanForTask(task.type);
}

function defaultVerificationPlanForTask(type: GrowthTask['type']): GrowthVerificationPlan {

  switch (type) {
    case 'review_request':
      return {
        metric: 'review_count',
        method: 'before_after',
        direction: 'increase',
        label: 'Google 評論總數',
        prompt: '填入執行前與目前的評論總數。',
        unit: '則',
      };
    case 'photo_refresh':
      return {
        metric: 'photo_count',
        method: 'before_after',
        direction: 'increase',
        label: '商家照片總數',
        prompt: '填入執行前與目前可見的商家照片數。',
        unit: '張',
      };
    case 'line_broadcast':
      return {
        metric: 'messages_sent',
        method: 'count',
        direction: 'completion',
        label: '實際送出人數',
        prompt: '填入這次訊息實際送達或傳送的人數。',
        unit: '人',
      };
    case 'gbp_post':
    case 'case_post':
    case 'quote_clarity':
    case 'service_page':
      return {
        metric: 'published_asset',
        method: 'url',
        direction: 'completion',
        label: '公開成果網址',
        prompt: '貼上已發布頁面或貼文的公開網址。',
      };
  }
}

export function withVerificationPlan(task: GrowthTask): GrowthTask {
  return { ...task, verification: defaultVerificationPlanForTask(task.type) };
}

export function buildGrowthBaselineSnapshot(input: {
  profile: StoreProfile;
  business: GrowthBusinessContext;
  history: CustomerGrowthCycle[];
  now?: Date;
}): GrowthBaselineSnapshot {
  return {
    capturedAt: (input.now ?? new Date()).toISOString(),
    source: 'store_profile',
    values: {
      selectedTagCount: input.profile.selectedTags.length,
      channelCount: (input.profile.channels ?? []).length,
      signatureItemCount: input.business.signatureItems.length,
      completedTaskCount: input.history.filter((cycle) => cycle.status === 'completed').length,
      verifiedImprovementCount: input.history.filter((cycle) => cycle.outcome_status === 'verified_improvement').length,
      hasWebsite: input.business.hasWebsite,
      hasGbpProfile: input.business.hasGbpProfile,
    },
  };
}

export type GrowthOutcomeEvaluation =
  | { ok: false; message: string }
  | {
      ok: true;
      result: GrowthResultSnapshot;
      status: GrowthOutcomeStatus;
      confidence: GrowthConfidenceLevel;
      recommendation: GrowthNextRecommendation;
      note?: string;
    };

export function evaluateGrowthOutcome(
  task: GrowthTask,
  evidence: GrowthOutcomeEvidence,
  now = new Date(),
): GrowthOutcomeEvaluation {
  const plan = verificationPlanForTask(task);
  const note = normalizeNote(evidence.note);

  if (plan.method === 'url') {
    const url = safePublicUrl(evidence.url);
    if (!url) return { ok: false, message: '請貼上有效的公開成果網址' };
    return successfulEvaluation({
      task,
      plan,
      evidence: { ...evidence, url },
      status: 'action_verified',
      confidence: 'medium',
      summary: '已用公開網址驗證本週動作完成；尚未把曝光或來客變化歸因給這次任務。',
      strategy: 'measure',
      rationale: '下週先觀察這項公開成果帶來的互動，再決定延續或換方向。',
      note,
      now,
    });
  }

  if (plan.method === 'count') {
    const count = finiteMetric(evidence.count);
    if (count === null || count < 1) return { ok: false, message: `請填入至少 1 ${plan.unit ?? '次'}的實際數量` };
    return successfulEvaluation({
      task,
      plan,
      evidence: { ...evidence, count },
      status: 'action_verified',
      confidence: 'medium',
      summary: `已記錄本週實際執行 ${formatMetric(count)}${plan.unit ?? ''}；這證明動作完成，不代表已產生營收。`,
      strategy: 'measure',
      rationale: '下一週優先記錄回覆、預約或到店等下游訊號。',
      note,
      now,
    });
  }

  if (plan.method === 'confirmation') {
    if (evidence.confirmed !== true) return { ok: false, message: '請確認本週任務已按完成標準執行' };
    return successfulEvaluation({
      task,
      plan,
      evidence,
      status: 'action_verified',
      confidence: 'low',
      summary: '已由店家確認完成；目前沒有可比較的外部數值，因此不宣稱指標改善。',
      strategy: 'measure',
      rationale: '下一週改用可留下網址或前後數值的任務，提高驗收可信度。',
      note,
      now,
    });
  }

  const beforeValue = finiteMetric(evidence.beforeValue);
  const afterValue = finiteMetric(evidence.afterValue);
  if (beforeValue === null || afterValue === null) {
    return { ok: false, message: `請填入${plan.label}的執行前與目前數值` };
  }
  const delta = afterValue - beforeValue;
  const directionalDelta = plan.direction === 'decrease' ? -delta : delta;
  const status: GrowthOutcomeStatus = directionalDelta > 0
    ? 'verified_improvement'
    : directionalDelta < 0
      ? 'verified_regression'
      : 'verified_no_change';
  const statusText = status === 'verified_improvement' ? '改善' : status === 'verified_regression' ? '退步' : '沒有變化';
  const strategy = status === 'verified_improvement' ? 'continue' : status === 'verified_no_change' ? 'adjust' : 'switch';
  const rationale = status === 'verified_improvement'
    ? '保留有效方向，但仍需再觀察一週確認是否能重現。'
    : status === 'verified_no_change'
      ? '動作已完成但數值未變，下週調整訊息、對象或呈現方式。'
      : '先停止重複同一做法，檢查資料與執行條件後改用另一個成長面向。';

  return successfulEvaluation({
    task,
    plan,
    evidence: { ...evidence, beforeValue, afterValue },
    status,
    confidence: 'medium',
    summary: `${plan.label}從 ${formatMetric(beforeValue)} 變為 ${formatMetric(afterValue)}${plan.unit ?? ''}，觀察結果為${statusText}；這是前後差異，不代表單一因果。`,
    strategy,
    rationale,
    note,
    now,
  });
}

function successfulEvaluation(input: {
  task: GrowthTask;
  plan: GrowthVerificationPlan;
  evidence: GrowthOutcomeEvidence;
  status: GrowthOutcomeStatus;
  confidence: GrowthConfidenceLevel;
  summary: string;
  strategy: GrowthNextRecommendation['strategy'];
  rationale: string;
  note?: string;
  now: Date;
}): Extract<GrowthOutcomeEvaluation, { ok: true }> {
  const beforeValue = finiteMetric(input.evidence.beforeValue);
  const afterValue = finiteMetric(input.evidence.afterValue);
  return {
    ok: true,
    result: {
      submittedAt: input.now.toISOString(),
      metric: input.plan.metric,
      method: input.plan.method,
      beforeValue,
      afterValue,
      delta: beforeValue !== null && afterValue !== null ? afterValue - beforeValue : null,
      count: finiteMetric(input.evidence.count),
      url: safePublicUrl(input.evidence.url),
      summary: input.summary,
    },
    status: input.status,
    confidence: input.confidence,
    recommendation: {
      strategy: input.strategy,
      rationale: input.rationale,
      preferredDimension: input.task.scoreDimension,
    },
    ...(input.note ? { note: input.note } : {}),
  };
}

function finiteMetric(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_METRIC_VALUE) return null;
  return value;
}

function safePublicUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeNote(value: string | undefined) {
  const note = value?.trim();
  return note ? note.slice(0, 300) : undefined;
}

function formatMetric(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
