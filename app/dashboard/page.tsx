import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/ui/signout-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { user } = session || {};

  return (
    <div className="h-full flex flex-col items-center justify-center bg-card relative">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Tool Tracker Dashboard</CardTitle>
            {user?.role === "admin" ? (
              <CardDescription>
                Welcome, admin {user?.name}! This is your dashboard where you
                can manage your tools and view your activity.
              </CardDescription>
            ) : (
              <CardDescription>
                Welcome, user {user?.name}! This is your dashboard where you can
                manage your profile and view your activity.
              </CardDescription>
            )}
            <CardDescription className="text-primary">
              Name: {user?.name}
            </CardDescription>
            <CardDescription className="text-primary">
              Email: {user?.email}
            </CardDescription>
            <CardDescription className="text-primary">
              Role: {user?.role}
            </CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="flex-col gap-2">
            <SignOutButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
