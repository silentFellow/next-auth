import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const routes = {
  admin: ["/create-blog", "/edit-blog"],
  user: [],
};

const userRoles = {
  admin: 1,
  user: 2
};

function matchRoute(route: string, path: string): boolean {
  const routeSegments = route.split('/').filter(Boolean);
  const pathSegments = path.split('/').filter(Boolean);

  if (routeSegments.length !== pathSegments.length) {
    return false;
  }

  return routeSegments.every((segment, index) => {
    return segment.startsWith(':') || segment === pathSegments[index];
  });
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.role) return NextResponse.redirect(new URL('/sign-in', request.url));
  if(token && token.role && request.nextUrl.pathname === "/sign-in") return NextResponse.redirect(new URL('/', request.url));

  const role = token.role as keyof typeof userRoles;

  const isAdminRoute = routes.admin.some((route) => matchRoute(route, request.nextUrl.pathname));
  const isUserRoute = routes.user.some((route) => matchRoute(route, request.nextUrl.pathname));

  if (isAdminRoute && userRoles[role] >= userRoles["admin"]) return NextResponse.next();
  if (isUserRoute && userRoles[role] >= userRoles["user"]) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
