"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const { user } = session || {};

  return (
    <div className="h-full flex flex-col items-center justify-center bg-card">
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Tool Tracker Dashboard</CardTitle>
            <CardDescription>
              Welcome, {user?.name || "User"}! This is your dashboard where you
              can manage your tools and view your activity.
            </CardDescription>
            <CardDescription className="text-primary">Name: {user?.name}</CardDescription>
            <CardDescription className="text-primary">Email: {user?.email}</CardDescription>
            <CardDescription className="text-primary">Role: {user?.role}</CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              onClick={async () =>
                await signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/"); // redirect to login page
                    },
                  },
                })
              }
              className="w-full"
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
