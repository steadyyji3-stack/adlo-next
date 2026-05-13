import { NextRequest } from 'next/server';

export function isAdminRequest(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.cookies.get('admin_token')?.value === secret;
}
