import { z } from 'zod';
import type { SiteCheckStatus, SiteOptimizationReport } from '@/lib/customer-site-optimizer';

const snapshotCheckSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  status: z.enum(['pass', 'warn', 'fail']),
});

const snapshotPageSchema = z.object({
  path: z.string().min(1).max(500),
  score: z.number().int().min(0).max(100),
  checks: z.array(snapshotCheckSchema).max(20),
});

export const siteOptimizerSnapshotSchema = z.object({
  version: z.literal(1),
  pages: z.array(snapshotPageSchema).min(1).max(8),
});

export type SiteOptimizerSnapshot = z.infer<typeof siteOptimizerSnapshotSchema>;

export interface SiteOptimizerHistoryEntry {
  id: string;
  hostname: string;
  overallScore: number;
  pageCount: number;
  coverage: 'sitemap' | 'homepage_only';
  scannedAt: string;
}

export interface SiteOptimizerCheckChange {
  path: string;
  checkId: string;
  label: string;
  before: SiteCheckStatus | null;
  after: SiteCheckStatus;
}

export interface SiteOptimizerPageChange {
  path: string;
  beforeScore: number;
  afterScore: number;
  delta: number;
}

export interface SiteOptimizerComparison {
  previousScanId: string;
  currentScanId: string;
  scoreDelta: number;
  previousScore: number;
  currentScore: number;
  commonPages: number;
  previousPages: number;
  currentPages: number;
  resolved: SiteOptimizerCheckChange[];
  improved: SiteOptimizerCheckChange[];
  regressed: SiteOptimizerCheckChange[];
  newIssues: SiteOptimizerCheckChange[];
  pageChanges: SiteOptimizerPageChange[];
}

interface ComparableScan {
  id: string;
  overallScore: number;
  snapshot: SiteOptimizerSnapshot;
}

const statusRank: Record<SiteCheckStatus, number> = { fail: 0, warn: 1, pass: 2 };

export function buildSiteOptimizerSnapshot(report: SiteOptimizationReport): SiteOptimizerSnapshot {
  return siteOptimizerSnapshotSchema.parse({
    version: 1,
    pages: report.pages.map((page) => ({
      path: page.path,
      score: page.score,
      checks: page.checks.map((check) => ({
        id: check.id,
        label: check.label,
        status: check.status,
      })),
    })),
  });
}

export function compareSiteOptimizerScans(
  previous: ComparableScan,
  current: ComparableScan,
): SiteOptimizerComparison {
  const previousPages = new Map(previous.snapshot.pages.map((page) => [page.path, page]));
  const currentPages = new Map(current.snapshot.pages.map((page) => [page.path, page]));
  const resolved: SiteOptimizerCheckChange[] = [];
  const improved: SiteOptimizerCheckChange[] = [];
  const regressed: SiteOptimizerCheckChange[] = [];
  const newIssues: SiteOptimizerCheckChange[] = [];
  const pageChanges: SiteOptimizerPageChange[] = [];

  for (const [path, currentPage] of currentPages) {
    const previousPage = previousPages.get(path);
    if (!previousPage) {
      currentPage.checks
        .filter((check) => check.status !== 'pass')
        .forEach((check) => newIssues.push(change(path, check, null)));
      continue;
    }

    pageChanges.push({
      path,
      beforeScore: previousPage.score,
      afterScore: currentPage.score,
      delta: currentPage.score - previousPage.score,
    });

    const previousChecks = new Map(previousPage.checks.map((check) => [check.id, check]));
    for (const currentCheck of currentPage.checks) {
      const previousCheck = previousChecks.get(currentCheck.id);
      if (!previousCheck) {
        if (currentCheck.status !== 'pass') newIssues.push(change(path, currentCheck, null));
        continue;
      }
      if (previousCheck.status === currentCheck.status) continue;

      const item = change(path, currentCheck, previousCheck.status);
      if (currentCheck.status === 'pass' && previousCheck.status !== 'pass') resolved.push(item);
      else if (statusRank[currentCheck.status] > statusRank[previousCheck.status]) improved.push(item);
      else regressed.push(item);
    }
  }

  return {
    previousScanId: previous.id,
    currentScanId: current.id,
    scoreDelta: current.overallScore - previous.overallScore,
    previousScore: previous.overallScore,
    currentScore: current.overallScore,
    commonPages: pageChanges.length,
    previousPages: previous.snapshot.pages.length,
    currentPages: current.snapshot.pages.length,
    resolved: sortedChanges(resolved),
    improved: sortedChanges(improved),
    regressed: sortedChanges(regressed),
    newIssues: sortedChanges(newIssues),
    pageChanges: pageChanges.sort((left, right) => right.delta - left.delta || left.path.localeCompare(right.path)),
  };
}

function change(
  path: string,
  check: { id: string; label: string; status: SiteCheckStatus },
  before: SiteCheckStatus | null,
): SiteOptimizerCheckChange {
  return { path, checkId: check.id, label: check.label, before, after: check.status };
}

function sortedChanges(changes: SiteOptimizerCheckChange[]) {
  return changes.sort((left, right) => left.path.localeCompare(right.path) || left.label.localeCompare(right.label));
}
