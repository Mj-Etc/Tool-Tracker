"use client";

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
import { CreateItem } from "@/components/create-item-form";
import { useSession } from "@/lib/auth-client";
import { ListItem } from "@/components/list-item";

export function MainClient() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div className="h-screen bg-card flex items-center justify-center relative">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <div className="flex min-h-svh w-full items-center gap-4 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Tool Tracker Admin Dashboard</CardTitle>
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
          </CardHeader>
          <CardContent>
            <CardDescription className="text-primary">
              Name: {user?.name}
            </CardDescription>
            <CardDescription className="text-primary">
              Email: {user?.email}
            </CardDescription>
            <CardDescription className="text-primary">
              Role: {user?.role}
            </CardDescription>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <SignOutButton />
          </CardFooter>
        </Card>
        <CreateItem />
      </div>
      <div className="h-full w-full overflow-hidden grow">
        <div className="flex h-full flex-col gap-4 items-center p-4 overflow-y-auto grow">
          <ListItem id={session?.user?.id}/>
        </div>
      </div>
    </div>
  );
}
