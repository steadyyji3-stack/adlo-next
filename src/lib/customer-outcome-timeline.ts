export type CustomerOutcomeTimelineKind = 'growth' | 'site_scan' | 'review_draft' | 'report';
export type CustomerOutcomeTimelineTone = 'positive' | 'attention' | 'neutral';

export interface CustomerOutcomeTimelineItem {
  id: string;
  kind: CustomerOutcomeTimelineKind;
  occurredAt: string;
  title: string;
  summary: string;
  statusLabel: string;
  tone: CustomerOutcomeTimelineTone;
  href: string | null;
  metric: string | null;
}

export interface OutcomeGrowthCycleInput {
  id: string;
  status: 'ready' | 'completed';
  task: { title: string };
  outcome_status?: 'action_verified' | 'verified_improvement' | 'verified_no_change' | 'verified_regression' | null;
  result_snapshot?: { summary: string } | null;
  completed_at: string | null;
  updated_at: string;
}

export interface OutcomeSiteScanInput {
  id: string;
  hostname: string;
  overall_score: number;
  page_count: number;
  scanned_at: string;
}

export interface OutcomeReviewDraftInput {
  id: string;
  reviewer_name: string | null;
  rating: number;
  status: 'draft' | 'copied';
  generated_at: string;
  updated_at: string;
}

export interface OutcomeReportInput {
  id: string;
  period_start: string;
  period_end: string;
  sent_at: string | null;
  generated_at: string;
}

export function buildCustomerOutcomeTimeline(input: {
  growthCycles: OutcomeGrowthCycleInput[];
  siteScans: OutcomeSiteScanInput[];
  reviewDrafts: OutcomeReviewDraftInput[];
  reports: OutcomeReportInput[];
  limit?: number;
}): CustomerOutcomeTimelineItem[] {
  const items = [
    ...growthItems(input.growthCycles),
    ...siteScanItems(input.siteScans),
    ...reviewDraftItems(input.reviewDrafts),
    ...reportItems(input.reports),
  ];

  return items
    .sort((left, right) => timestamp(right.occurredAt) - timestamp(left.occurredAt))
    .slice(0, Math.max(1, input.limit ?? 30));
}

function growthItems(cycles: OutcomeGrowthCycleInput[]): CustomerOutcomeTimelineItem[] {
  return cycles.filter((cycle) => cycle.status === 'completed').map((cycle) => {
    const presentation = growthOutcomePresentation(cycle.outcome_status);
    return {
      id: `growth:${cycle.id}`,
      kind: 'growth',
      occurredAt: cycle.completed_at ?? cycle.updated_at,
      title: cycle.task.title,
      summary: cycle.result_snapshot?.summary ?? '本週動作已完成，紀錄已保存供後續比較。',
      statusLabel: presentation.label,
      tone: presentation.tone,
      href: '/customer/week',
      metric: null,
    };
  });
}

function siteScanItems(scans: OutcomeSiteScanInput[]): CustomerOutcomeTimelineItem[] {
  const previousByHostname = new Map<string, OutcomeSiteScanInput>();
  const items: CustomerOutcomeTimelineItem[] = [];

  for (const scan of [...scans].sort((left, right) => timestamp(left.scanned_at) - timestamp(right.scanned_at))) {
    const previous = previousByHostname.get(scan.hostname);
    const delta = previous ? scan.overall_score - previous.overall_score : null;
    previousByHostname.set(scan.hostname, scan);
    const presentation = scorePresentation(delta);

    items.push({
      id: `site:${scan.id}`,
      kind: 'site_scan',
      occurredAt: scan.scanned_at,
      title: `${scan.hostname} 網站檢查`,
      summary: previous
        ? `這次檢查 ${scan.page_count} 頁；分數較同一網站上次紀錄${delta === 0 ? '相同' : `${delta! > 0 ? '增加' : '減少'} ${Math.abs(delta!)} 分`}。`
        : `完成 ${scan.page_count} 頁基準檢查，之後重掃即可觀察前後差異。`,
      statusLabel: presentation.label,
      tone: presentation.tone,
      href: '/customer/tools/site-optimizer',
      metric: `${scan.overall_score} 分`,
    });
  }

  return items;
}

function reviewDraftItems(drafts: OutcomeReviewDraftInput[]): CustomerOutcomeTimelineItem[] {
  return drafts.map((draft) => ({
    id: `review:${draft.id}`,
    kind: 'review_draft',
    occurredAt: draft.updated_at || draft.generated_at,
    title: draft.status === 'copied' ? '評論回覆已複製' : '評論回覆草稿已產生',
    summary: draft.reviewer_name
      ? `已為 ${draft.reviewer_name} 的 ${draft.rating} 星評論準備回覆。`
      : `已為一則 ${draft.rating} 星評論準備回覆。`,
    statusLabel: draft.status === 'copied' ? '可發布成品' : '待確認',
    tone: draft.status === 'copied' ? 'positive' : 'neutral',
    href: '/customer/tools/review-workspace',
    metric: `${draft.rating} 星`,
  }));
}

function reportItems(reports: OutcomeReportInput[]): CustomerOutcomeTimelineItem[] {
  return reports.map((report) => ({
    id: `report:${report.id}`,
    kind: 'report',
    occurredAt: report.sent_at ?? report.generated_at,
    title: `${formatReportMonth(report.period_start)}成果摘要`,
    summary: `整理 ${formatShortDate(report.period_start)} 至 ${formatShortDate(report.period_end)} 已保存的店家紀錄。`,
    statusLabel: report.sent_at ? '已寄出' : '已產生',
    tone: 'positive',
    href: null,
    metric: null,
  }));
}

function growthOutcomePresentation(status: OutcomeGrowthCycleInput['outcome_status']) {
  if (status === 'verified_improvement') return { label: '觀察到改善', tone: 'positive' as const };
  if (status === 'verified_regression') return { label: '需要調整', tone: 'attention' as const };
  if (status === 'verified_no_change') return { label: '暫無變化', tone: 'neutral' as const };
  return { label: '動作已完成', tone: 'positive' as const };
}

function scorePresentation(delta: number | null) {
  if (delta === null) return { label: '建立基準', tone: 'neutral' as const };
  if (delta > 0) return { label: '分數增加', tone: 'positive' as const };
  if (delta < 0) return { label: '分數減少', tone: 'attention' as const };
  return { label: '分數相同', tone: 'neutral' as const };
}

function formatReportMonth(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '本期';
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function timestamp(value: string) {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}
