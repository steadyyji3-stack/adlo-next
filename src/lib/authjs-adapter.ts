import type { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from 'next-auth/adapters';
import { deleteRows, insertRow, selectRows, updateRows, upsertRow } from '@/lib/supabase-rest';

interface AuthUserRow {
  id: string;
  name: string | null;
  email: string;
  email_verified: string | null;
  image: string | null;
}

interface AuthAccountRow {
  id: string;
  user_id: string;
  type: AdapterAccount['type'];
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  oauth_token_secret: string | null;
  oauth_token: string | null;
}

interface AuthSessionRow {
  id: string;
  session_token: string;
  user_id: string;
  expires: string;
}

interface AuthVerificationTokenRow {
  identifier: string;
  token: string;
  expires: string;
}

export function SupabaseRestAuthAdapter(): Adapter {
  return {
    async createUser(user) {
      return mapUser(await insertRow<AuthUserRow>('authjs_users', userToRow(user)));
    },
    async getUser(id) {
      const [user] = await selectRows<AuthUserRow>('authjs_users', { id }, { limit: 1 });
      return user ? mapUser(user) : null;
    },
    async getUserByEmail(email) {
      const [user] = await selectRows<AuthUserRow>('authjs_users', { email: normalizeEmail(email) }, { limit: 1 });
      return user ? mapUser(user) : null;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const [account] = await selectRows<AuthAccountRow>(
        'authjs_accounts',
        { provider, provider_account_id: providerAccountId },
        { limit: 1 },
      );
      if (!account) return null;
      const [user] = await selectRows<AuthUserRow>('authjs_users', { id: account.user_id }, { limit: 1 });
      return user ? mapUser(user) : null;
    },
    async updateUser(user) {
      const [updated] = await updateRows<AuthUserRow>('authjs_users', { id: user.id }, userToRow(user));
      if (!updated) throw new Error('Auth.js user not found');
      return mapUser(updated);
    },
    async linkAccount(account) {
      await upsertRow<AuthAccountRow>('authjs_accounts', accountToRow(account), 'provider,provider_account_id');
      return account;
    },
    async getAccount(providerAccountId, provider) {
      const [account] = await selectRows<AuthAccountRow>(
        'authjs_accounts',
        { provider, provider_account_id: providerAccountId },
        { limit: 1 },
      );
      return account ? mapAccount(account) : null;
    },
    async createSession(session) {
      return mapSession(await insertRow<AuthSessionRow>('authjs_sessions', sessionToRow(session)));
    },
    async getSessionAndUser(sessionToken) {
      const [session] = await selectRows<AuthSessionRow>('authjs_sessions', { session_token: sessionToken }, { limit: 1 });
      if (!session) return null;
      const [user] = await selectRows<AuthUserRow>('authjs_users', { id: session.user_id }, { limit: 1 });
      if (!user) return null;
      return {
        session: mapSession(session),
        user: mapUser(user),
      };
    },
    async updateSession(session) {
      const [updated] = await updateRows<AuthSessionRow>('authjs_sessions', { session_token: session.sessionToken }, sessionToRow(session));
      return updated ? mapSession(updated) : null;
    },
    async deleteSession(sessionToken) {
      const [deleted] = await deleteRows<AuthSessionRow>('authjs_sessions', { session_token: sessionToken });
      return deleted ? mapSession(deleted) : null;
    },
    async createVerificationToken(token) {
      return mapVerificationToken(await insertRow<AuthVerificationTokenRow>('authjs_verification_tokens', verificationTokenToRow(token)));
    },
    async useVerificationToken({ identifier, token }) {
      const filters = { identifier: normalizeEmail(identifier), token };
      const [existing] = await selectRows<AuthVerificationTokenRow>('authjs_verification_tokens', filters, { limit: 1 });
      if (!existing) return null;
      await deleteRows<AuthVerificationTokenRow>('authjs_verification_tokens', filters);
      return mapVerificationToken(existing);
    },
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapUser(row: AuthUserRow): AdapterUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.email_verified ? new Date(row.email_verified) : null,
    image: row.image,
  };
}

function userToRow(user: Partial<AdapterUser>) {
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ? normalizeEmail(user.email) : undefined,
    email_verified: user.emailVerified ? user.emailVerified.toISOString() : null,
    image: user.image ?? null,
  };
}

function mapAccount(row: AuthAccountRow): AdapterAccount {
  return {
    userId: row.user_id,
    type: row.type,
    provider: row.provider,
    providerAccountId: row.provider_account_id,
    refresh_token: row.refresh_token ?? undefined,
    access_token: row.access_token ?? undefined,
    expires_at: row.expires_at ?? undefined,
    token_type: row.token_type ? row.token_type as Lowercase<string> : undefined,
    scope: row.scope ?? undefined,
    id_token: row.id_token ?? undefined,
    session_state: row.session_state ?? undefined,
    oauth_token_secret: row.oauth_token_secret,
    oauth_token: row.oauth_token,
  };
}

function accountToRow(account: AdapterAccount) {
  return {
    user_id: account.userId,
    type: account.type,
    provider: account.provider,
    provider_account_id: account.providerAccountId,
    refresh_token: account.refresh_token ?? null,
    access_token: account.access_token ?? null,
    expires_at: account.expires_at ?? null,
    token_type: account.token_type ?? null,
    scope: account.scope ?? null,
    id_token: account.id_token ?? null,
    session_state: account.session_state ?? null,
    oauth_token_secret: account.oauth_token_secret ?? null,
    oauth_token: account.oauth_token ?? null,
  };
}

function mapSession(row: AuthSessionRow): AdapterSession {
  return {
    sessionToken: row.session_token,
    userId: row.user_id,
    expires: new Date(row.expires),
  };
}

function sessionToRow(session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
  return {
    session_token: session.sessionToken,
    user_id: session.userId,
    expires: session.expires?.toISOString(),
  };
}

function mapVerificationToken(row: AuthVerificationTokenRow): VerificationToken {
  return {
    identifier: row.identifier,
    token: row.token,
    expires: new Date(row.expires),
  };
}

function verificationTokenToRow(token: VerificationToken) {
  return {
    identifier: normalizeEmail(token.identifier),
    token: token.token,
    expires: token.expires.toISOString(),
  };
}
