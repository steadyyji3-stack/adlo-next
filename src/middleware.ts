import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (isCustomerPath(request.nextUrl.pathname)) {
    if (isCustomerLoginPath(request.nextUrl.pathname) || hasAuthSessionCookie(request)) {
      return NextResponse.next();
    }

    const loginUrl = new URL('/customer/login', request.url);
    loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get('admin_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isLoginPage) return NextResponse.next();

  if (token !== process.env.ADMIN_SECRET) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/customer/:path*', '/onboarding'],
};

function isCustomerPath(pathname: string) {
  return pathname === '/onboarding' || pathname.startsWith('/customer');
}

function isCustomerLoginPath(pathname: string) {
  return pathname === '/customer/login' || pathname.startsWith('/customer/login/');
}

function hasAuthSessionCookie(request: NextRequest) {
  return Boolean(
    request.cookies.get('authjs.session-token')?.value
    ?? request.cookies.get('__Secure-authjs.session-token')?.value
    ?? request.cookies.get('next-auth.session-token')?.value
    ?? request.cookies.get('__Secure-next-auth.session-token')?.value,
  );
}
