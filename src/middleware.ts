import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((request) => {
  if (isCustomerPath(request.nextUrl.pathname)) {
    if (isCustomerLoginPath(request.nextUrl.pathname) || request.auth?.user?.customerId) {
      return NextResponse.next();
    }

    const loginUrl = new URL('/customer/login', request.url);
    loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get('admin_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isLoginPage) return NextResponse.next();

  // fail-closed：ADMIN_SECRET 未設定時一律導回登入頁。
  // 舊版只比 `token !== process.env.ADMIN_SECRET`，env 漏設（例如 preview
  // 環境沒配、或未來改名）時 `undefined !== undefined` 為 false，
  // 沒帶 cookie 也會被放行，整個 /admin 頁面全開。
  const secret = process.env.ADMIN_SECRET;
  if (!secret || token !== secret) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/customer/:path*', '/onboarding'],
};

function isCustomerPath(pathname: string) {
  return pathname === '/onboarding' || pathname.startsWith('/customer');
}

function isCustomerLoginPath(pathname: string) {
  return pathname === '/customer/login' || pathname.startsWith('/customer/login/');
}
