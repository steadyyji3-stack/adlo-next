import 'server-only';

type QueryValue = string | number | boolean | null | undefined;

export type SupabaseFilter = Record<string, QueryValue>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: URLSearchParams;
  body?: unknown;
  prefer?: string;
}

export class SupabaseRestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SupabaseRestError('Supabase 環境變數尚未設定', 500);
  }

  return {
    baseUrl: `${url.replace(/\/$/, '')}/rest/v1`,
    serviceRoleKey,
  };
}

function buildEqQuery(filters?: SupabaseFilter) {
  const query = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, `eq.${String(value)}`);
    }
  });
  return query;
}

async function request<T>(table: string, options: RequestOptions = {}): Promise<T> {
  const { baseUrl, serviceRoleKey } = getSupabaseConfig();
  const query = options.query?.toString();
  const response = await fetch(`${baseUrl}/${table}${query ? `?${query}` : ''}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      'content-type': 'application/json',
      ...(options.prefer ? { prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    throw new SupabaseRestError('Supabase request failed', response.status, details);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function selectRows<T>(
  table: string,
  filters?: SupabaseFilter,
  options?: { order?: string; limit?: number; select?: string },
): Promise<T[]> {
  const query = buildEqQuery(filters);
  query.set('select', options?.select ?? '*');
  if (options?.order) query.set('order', options.order);
  if (options?.limit) query.set('limit', String(options.limit));
  return request<T[]>(table, { query });
}

export async function insertRow<T>(table: string, body: unknown): Promise<T> {
  const rows = await request<T[]>(table, {
    method: 'POST',
    body,
    prefer: 'return=representation',
  });
  return rows[0];
}

export async function upsertRow<T>(
  table: string,
  body: unknown,
  onConflict: string,
): Promise<T> {
  const query = new URLSearchParams({ on_conflict: onConflict });
  const rows = await request<T[]>(table, {
    method: 'POST',
    query,
    body,
    prefer: 'resolution=merge-duplicates,return=representation',
  });
  return rows[0];
}

export async function updateRows<T>(
  table: string,
  filters: SupabaseFilter,
  body: unknown,
): Promise<T[]> {
  return request<T[]>(table, {
    method: 'PATCH',
    query: buildEqQuery(filters),
    body,
    prefer: 'return=representation',
  });
}

export async function deleteRows<T>(
  table: string,
  filters: SupabaseFilter,
): Promise<T[]> {
  return request<T[]>(table, {
    method: 'DELETE',
    query: buildEqQuery(filters),
    prefer: 'return=representation',
  });
}
