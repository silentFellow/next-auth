import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const userRoutes: string[] = [ "/blog/read-blog/:blog_id", '/blog/create-blog', "/" ]
const adminRoutes: string[] = [ "/blog/create-blog" ]
const superAdminRoutes: string[] = [ "/blog/create-blog" ]

const userRoles = {
  user: 3,
  admin: 2,
  superadmin: 1,
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.role) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const role = token.role as keyof typeof userRoles;

  if (superAdminRoutes.includes(request.nextUrl.pathname) && userRoles[role] <= userRoles["superadmin"]) {
    return NextResponse.next();
  }

  if (adminRoutes.includes(request.nextUrl.pathname) && userRoles[role] <= userRoles["admin"]) {
    return NextResponse.next();
  }

  if (userRoutes.includes(request.nextUrl.pathname) && userRoles[role] <= userRoles["user"]) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/sign-in', request.url));
}

export const config = {
  matcher: ["/", `/blog/:path*`]
};
