import { z } from 'zod';
import type { StoreProfile } from '@/lib/store-profile';

export const growthVerificationPlanSchema = z.object({
  metric: z.enum([
    'published_asset',
    'review_count',
    'photo_count',
    'messages_sent',
    'check_score',
    'local_rank',
  ]),
  method: z.enum(['url', 'before_after', 'count', 'confirmation']),
  direction: z.enum(['increase', 'decrease', 'completion']),
  label: z.string().trim().min(2).max(60),
  prompt: z.string().trim().min(4).max(180),
  unit: z.string().trim().min(1).max(16).optional(),
}).strict();

export const growthTaskSchema = z.object({
  type: z.enum([
    'gbp_post',
    'line_broadcast',
    'review_request',
    'case_post',
    'quote_clarity',
    'photo_refresh',
    'service_page',
  ]),
  title: z.string().trim().min(4).max(60),
  objective: z.string().trim().min(8).max(180),
  whyNow: z.string().trim().min(8).max(300),
  scoreDimension: z.enum(['profile', 'reviews', 'reply', 'photos', 'keywords', 'local', 'content']),
  estimatedMinutes: z.number().int().min(5).max(30),
  steps: z.array(z.string().trim().min(2).max(160)).min(2).max(4),
  deliverables: z.array(z.object({
    label: z.string().trim().min(2).max(50),
    content: z.string().trim().min(8).max(2000),
    usage: z.string().trim().min(4).max(160),
  })).min(1).max(3),
  successCheck: z.string().trim().min(6).max(200),
  verification: growthVerificationPlanSchema.optional(),
}).strict();

export type GrowthTask = z.infer<typeof growthTaskSchema>;
export type GrowthVerificationPlan = z.infer<typeof growthVerificationPlanSchema>;
export type GrowthCycleStatus = 'ready' | 'completed';
export type GrowthGenerationSource = 'groq' | 'template';
export type GrowthOutcomeStatus =
  | 'action_verified'
  | 'verified_improvement'
  | 'verified_no_change'
  | 'verified_regression';
export type GrowthConfidenceLevel = 'low' | 'medium' | 'high';
export type GrowthNextStrategy = 'continue' | 'adjust' | 'switch' | 'measure';

export interface GrowthBusinessContext {
  storeCity: string | null;
  hasWebsite: boolean;
  hasGbpProfile: boolean;
  signatureItems: string[];
}

export interface GrowthTaskRevision {
  task: GrowthTask;
  instruction: string | null;
  source: GrowthGenerationSource;
  savedAt: string;
}

export interface GrowthCycleFeedback {
  note?: string;
  revisions?: GrowthTaskRevision[];
}

export interface GrowthBaselineSnapshot {
  capturedAt: string;
  source: 'store_profile';
  values: {
    selectedTagCount: number;
    channelCount: number;
    signatureItemCount: number;
    completedTaskCount: number;
    verifiedImprovementCount: number;
    hasWebsite: boolean;
    hasGbpProfile: boolean;
  };
}

export interface GrowthOutcomeEvidence {
  confirmed?: boolean;
  url?: string;
  beforeValue?: number;
  afterValue?: number;
  count?: number;
  note?: string;
}

export interface GrowthResultSnapshot {
  submittedAt: string;
  metric: GrowthVerificationPlan['metric'];
  method: GrowthVerificationPlan['method'];
  beforeValue: number | null;
  afterValue: number | null;
  delta: number | null;
  count: number | null;
  url: string | null;
  summary: string;
}

export interface GrowthNextRecommendation {
  strategy: GrowthNextStrategy;
  rationale: string;
  preferredDimension: GrowthTask['scoreDimension'];
}

export interface CustomerGrowthCycle {
  id: string;
  customer_id: string;
  week_start: string;
  status: GrowthCycleStatus;
  task: GrowthTask;
  evidence: string[];
  profile_snapshot: StoreProfile;
  generation_source: GrowthGenerationSource;
  generation_count: number;
  instruction: string | null;
  feedback: GrowthCycleFeedback | null;
  baseline_snapshot?: GrowthBaselineSnapshot | null;
  result_snapshot?: GrowthResultSnapshot | null;
  outcome_status?: GrowthOutcomeStatus | null;
  confidence_level?: GrowthConfidenceLevel | null;
  next_recommendation?: GrowthNextRecommendation | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
