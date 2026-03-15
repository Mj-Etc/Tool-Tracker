"use client";

import { ListItem } from "@/components/list-item";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SignOutButton } from "@/components/ui/signout-button";
import { useSession } from "@/lib/auth-client";

export default function Page() {
  const { data: session, isPending } = useSession();
  const me = session;

  if (isPending) return <div className="h-screen flex items-center justify-center">
    <p>Loading...</p>
  </div>;

  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <div className="flex items-center gap-4">
        <ModeToggle />
        <SignOutButton />
      </div>
      <div className="flex flex-col gap-4">
        <ListItem />
      </div>
    </div>
  );
}
