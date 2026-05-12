import { NextResponse } from 'next/server';

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json<ApiErrorBody>(
    { ok: false, error: { code, message } },
    { status },
  );
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}
