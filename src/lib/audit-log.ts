import 'server-only';
import { insertRow } from '@/lib/supabase-rest';

const SENSITIVE_KEYS = new Set([
  'access_token',
  'refresh_token',
  'gbp_oauth_token',
  'google_oauth_token',
  'oauth_token',
  'token',
  'secret',
  'password',
  'authorization',
]);

type JsonPrimitive = string | number | boolean | null;
export type AuditPayload =
  | JsonPrimitive
  | AuditPayload[]
  | { [key: string]: AuditPayload | undefined };

interface AuditLogInput {
  actor: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  payload?: AuditPayload;
}

function sanitizePayload(value: AuditPayload | undefined): AuditPayload | undefined {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => sanitizePayload(item) ?? null);

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) return [key, '[REDACTED]'];
      return [key, sanitizePayload(item)];
    }),
  );
}

export async function writeAuditLog(input: AuditLogInput) {
  await insertRow('audit_log', {
    actor: input.actor,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId ?? null,
    payload: sanitizePayload(input.payload) ?? null,
  });
}
