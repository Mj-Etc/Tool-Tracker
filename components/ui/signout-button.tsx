import { signOut } from "@/lib/auth-client";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "./spinner";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <Button onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          Signing out...
        </span>
      ) : (
        "Sign Out"
      )}
    </Button>
  );
}
