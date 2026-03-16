import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/admin/dashboard", "/cashier"];
const publicRoutes = ["/"];

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const path = request.nextUrl.pathname;
  const role = session?.user.role;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (session) {
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/cashier", request.nextUrl));
    }

    const isPublicRoute = publicRoutes.includes(path);
    if (isPublicRoute) {
      return NextResponse.redirect(
        new URL(
          role === "admin" ? "/admin/dashboard" : "/cashier",
          request.nextUrl,
        ),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Routes Proxy should not run on
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
