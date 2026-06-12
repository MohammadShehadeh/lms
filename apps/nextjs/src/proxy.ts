import { Redis } from "@nucleus/cache";
import { hasPermission } from "@nucleus/db/rbac";
import { RedisRateLimiter } from "@nucleus/rate-limit";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authRoutes, protectedRoutes, routePermissions } from "@/constants/routes";
import { getSession } from "./auth/server";

const rateLimiter = new RedisRateLimiter(Redis.getInstance(), {
  limit: 1000,
  window: 60_000,
});

export async function proxy(request: NextRequest) {
  const xffHeader = request.headers.get("x-forwarded-for");
  const clientIp = xffHeader?.split(",")[0] ?? "anonymous";
  const { allowed } = await rateLimiter.check(clientIp);
  const pathname = request.nextUrl.pathname;

  if (!allowed) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  const session = await getSession();

  // Check if the requested URL matches any protected route patterns
  const isProtectedRoute = () => {
    return protectedRoutes.some((path) => pathname.startsWith(path));
  };

  // Check if the requested URL matches any authentication route patterns
  const isAuthRoute = () => {
    return authRoutes.some((path) => pathname.startsWith(path));
  };

  // Handle route protection and redirects
  if ((isProtectedRoute() && !session) || (isAuthRoute() && session)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Permission-based route guard: an authenticated user without the required
  // permission is sent back to the dashboard.
  if (session) {
    const guarded = routePermissions.find((route) => pathname.startsWith(route.prefix));
    if (guarded && !hasPermission(session.user.permissions ?? [], guarded.permission)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - static (static files)
     * - public (public files)
     * - favicon.ico (favicon file)
     * - assets (assets)
     * - images (images)
     * - icons (icons)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
