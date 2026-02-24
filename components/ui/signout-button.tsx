"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "./button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
    const router = useRouter();
  return (
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
  );
}
