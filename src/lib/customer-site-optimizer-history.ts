import 'server-only';

import {
  buildSiteOptimizerSnapshot,
  compareSiteOptimizerScans,
  siteOptimizerSnapshotSchema,
  type SiteOptimizerComparison,
  type SiteOptimizerHistoryEntry,
  type SiteOptimizerSnapshot,
} from '@/lib/customer-site-optimizer-comparison';
import type { SiteOptimizationReport } from '@/lib/customer-site-optimizer';
import { insertRow, selectRows } from '@/lib/supabase-rest';

interface SiteOptimizerScanRow {
  id: string;
  customer_id: string;
  hostname: string;
  target_url: string;
  industry_mode: SiteOptimizationReport['industryMode'];
  coverage: SiteOptimizationReport['coverage'];
  overall_score: number;
  page_count: number;
  snapshot_version: number;
  snapshot: unknown;
  scanned_at: string;
  created_at: string;
}

interface ParsedSiteOptimizerScan extends SiteOptimizerScanRow {
  snapshot: SiteOptimizerSnapshot;
}

export interface SiteOptimizerHistoryState {
  history: SiteOptimizerHistoryEntry[];
  comparison: SiteOptimizerComparison | null;
}

export async function saveSiteOptimizerScan(input: {
  customerId: string;
  report: SiteOptimizationReport;
}): Promise<SiteOptimizerHistoryState & { scanId: string }> {
  const previous = await latestScan(input.customerId, input.report.hostname);
  const snapshot = buildSiteOptimizerSnapshot(input.report);
  const saved = parseScan(await insertRow<SiteOptimizerScanRow>('customer_site_optimizer_scans', {
    customer_id: input.customerId,
    hostname: input.report.hostname,
    target_url: input.report.targetUrl,
    industry_mode: input.report.industryMode,
    coverage: input.report.coverage,
    overall_score: input.report.overallScore,
    page_count: input.report.pages.length,
    snapshot_version: snapshot.version,
    snapshot,
    scanned_at: input.report.scannedAt,
  }));

  const rows = await listScans(input.customerId, input.report.hostname, 12);
  return {
    scanId: saved.id,
    history: rows.map(toHistoryEntry),
    comparison: previous
      ? compareSiteOptimizerScans(toComparableScan(previous), toComparableScan(saved))
      : null,
  };
}

export async function getSiteOptimizerHistoryState(
  customerId: string,
  hostname: string,
): Promise<SiteOptimizerHistoryState> {
  const rows = await listScans(customerId, hostname, 12);
  return {
    history: rows.map(toHistoryEntry),
    comparison: rows.length >= 2
      ? compareSiteOptimizerScans(toComparableScan(rows[1]), toComparableScan(rows[0]))
      : null,
  };
}

async function latestScan(customerId: string, hostname: string) {
  const rows = await listScans(customerId, hostname, 1);
  return rows[0] ?? null;
}

async function listScans(customerId: string, hostname: string, limit: number) {
  const rows = await selectRows<SiteOptimizerScanRow>(
    'customer_site_optimizer_scans',
    { customer_id: customerId, hostname },
    { order: 'scanned_at.desc', limit },
  );
  return rows.map(parseScan);
}

function parseScan(row: SiteOptimizerScanRow): ParsedSiteOptimizerScan {
  return { ...row, snapshot: siteOptimizerSnapshotSchema.parse(row.snapshot) };
}

function toHistoryEntry(row: ParsedSiteOptimizerScan): SiteOptimizerHistoryEntry {
  return {
    id: row.id,
    hostname: row.hostname,
    overallScore: row.overall_score,
    pageCount: row.page_count,
    coverage: row.coverage,
    scannedAt: row.scanned_at,
  };
}

function toComparableScan(row: ParsedSiteOptimizerScan) {
  return {
    id: row.id,
    overallScore: row.overall_score,
    snapshot: row.snapshot,
  };
}
