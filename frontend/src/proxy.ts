export const AUTH_COOKIE = 'conmeet_session';

export function proxy(request: Request) {
  const { pathname } = new URL(request.url);
  const hasSession = request.headers.get('cookie')?.includes(AUTH_COOKIE);

  if (!hasSession) {
    return Response.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
  }

  return null;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
