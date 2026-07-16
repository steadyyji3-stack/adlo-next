import { z } from 'zod';
import type { StoreProfile } from '@/lib/store-profile';

export const growthTaskSchema = z.object({
  type: z.enum(['gbp_post', 'line_broadcast', 'review_request']),
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
}).strict();

export type GrowthTask = z.infer<typeof growthTaskSchema>;
export type GrowthCycleStatus = 'ready' | 'completed';
export type GrowthGenerationSource = 'groq' | 'template';

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
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
