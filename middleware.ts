import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const userRoutes: string[] = [ "/read-blog/:blog_id", '/create-blog', "/", "/subscribe" ];
const adminRoutes: string[] = [];
const superAdminRoutes: string[] = [];

const userRoles = {
  user: 3,
  admin: 2,
  superadmin: 1,
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
  if (!token || !token.role) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const role = token.role as keyof typeof userRoles;

  const isSuperAdminRoute = superAdminRoutes.some((route) => matchRoute(route, request.nextUrl.pathname));
  const isAdminRoute = adminRoutes.some((route) => matchRoute(route, request.nextUrl.pathname));
  const isUserRoute = userRoutes.some((route) => matchRoute(route, request.nextUrl.pathname));

  if (isSuperAdminRoute && userRoles[role] <= userRoles["superadmin"]) {
    return NextResponse.next();
  }

  if (isAdminRoute && userRoles[role] <= userRoles["admin"]) {
    return NextResponse.next();
  }

  if (isUserRoute && userRoles[role] <= userRoles["user"]) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/sign-in', request.url));
}

export const config = {
  matcher: [
    "/((?!_next|auth|sign-in|sign-up|api/auth).*)", // Exclude _next and auth routes
  ]
};
