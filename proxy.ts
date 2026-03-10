import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/admin/dashboard", "/dashboard"];
const publicRoutes = ["/", "/sign-up"];

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
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    if (
      path.startsWith("/dashboard") &&
      !path.startsWith("/admin") &&
      role !== "cashier"
    ) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.nextUrl),
      );
    }

    const isPublicRoute = publicRoutes.includes(path);
    if (isPublicRoute) {
      return NextResponse.redirect(
        new URL(
          role === "admin" ? "/admin/dashboard" : "/dashboard",
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
