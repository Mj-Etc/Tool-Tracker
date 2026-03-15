import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type UserRole = "admin" | "cashier";

export async function getSession() {
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return {
    ...session.user,
    role: (user?.role as UserRole) || "cashier",
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!user || !roles.includes(user.role as UserRole)) {
    const { redirect } = await import("next/navigation");
    redirect(user?.role === "admin" ? "/admin/dashboard" : "/cashier/");
  }
  return user;
}

export async function hasRole(roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user || !user.role) return false;
  return roles.includes(user.role as UserRole);
}
