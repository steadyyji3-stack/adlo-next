import 'server-only';
import crypto from 'crypto';

const TOKEN_VERSION = 'v1';
const MIN_SECRET_LENGTH = 32;
const MAX_TTL_DAYS = 90;
const SECONDS_PER_DAY = 24 * 60 * 60;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CustomerLinkDestination = 'dashboard' | 'billing' | 'onboarding';

const destinationPaths: Record<CustomerLinkDestination, string> = {
  dashboard: '/customer/dashboard',
  billing: '/customer/billing',
  onboarding: '/onboarding',
};

export interface VerifiedCustomerLinkToken {
  customerId: string;
  expiresAt: Date;
}

export function createCustomerLinkToken(input: {
  customerId: string;
  expiresInDays?: number;
  now?: Date;
}) {
  const customerId = normalizeCustomerId(input.customerId);
  if (!customerId) {
    throw new Error('Invalid customer id');
  }

  const expiresInDays = clampExpiresInDays(input.expiresInDays ?? 30);
  const now = input.now ?? new Date();
  const expiresAtUnix = Math.floor(now.getTime() / 1000) + expiresInDays * SECONDS_PER_DAY;
  const unsigned = `${TOKEN_VERSION}.${customerId}.${expiresAtUnix}`;
  const signature = sign(unsigned, getCustomerLinkSecret());

  return {
    token: `${unsigned}.${signature}`,
    expiresAt: new Date(expiresAtUnix * 1000),
  };
}

export function verifyCustomerLinkToken(token?: string | null, now = new Date()): VerifiedCustomerLinkToken | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 4) return null;

  const [version, customerId, expiresAtRaw, signature] = parts;
  if (version !== TOKEN_VERSION) return null;
  const normalizedCustomerId = normalizeCustomerId(customerId);
  if (!normalizedCustomerId || !/^\d+$/.test(expiresAtRaw) || !signature) return null;

  const expiresAtUnix = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAtUnix) || expiresAtUnix <= Math.floor(now.getTime() / 1000)) {
    return null;
  }

  const secret = getOptionalCustomerLinkSecret();
  if (!secret) return null;

  const unsigned = `${TOKEN_VERSION}.${normalizedCustomerId}.${expiresAtUnix}`;
  const expectedSignature = sign(unsigned, secret);
  if (!safeEqual(signature, expectedSignature)) return null;

  return {
    customerId: normalizedCustomerId,
    expiresAt: new Date(expiresAtUnix * 1000),
  };
}

export function buildCustomerPathWithToken(destination: CustomerLinkDestination, token: string) {
  const params = new URLSearchParams({ customer_token: token });
  return `${destinationPaths[destination]}?${params.toString()}`;
}

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getCustomerLinkSecret() {
  const secret = getOptionalCustomerLinkSecret();
  if (!secret) {
    throw new Error(`CUSTOMER_LINK_SECRET must be at least ${MIN_SECRET_LENGTH} characters`);
  }
  return secret;
}

function getOptionalCustomerLinkSecret() {
  const secret = process.env.CUSTOMER_LINK_SECRET?.trim();
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return secret;
}

function normalizeCustomerId(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return UUID_PATTERN.test(trimmed) ? trimmed.toLowerCase() : null;
}

function clampExpiresInDays(value: number) {
  if (!Number.isFinite(value)) return 30;
  return Math.min(Math.max(Math.floor(value), 1), MAX_TTL_DAYS);
}
