"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const session = useSession();

  return (
    <main className="flex items-center justify-center h-screen bg-neutral-950 text-white">
      <div className="flex gap-4">
        {session.data?.user ? (
          <>
            <p>Welcome, {session.data.user.name || "User"}!</p>
            <button
              onClick={() => signOut()}
              className="bg-white text-black font-medium px-6 py-2 rounded-md hover:bg-gray-200"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/sign-up")}
              className="bg-white text-black font-medium px-6 py-2 rounded-md hover:bg-gray-200"
            >
              Sign Up
            </button>
            <button
              onClick={() => router.push("/sign-in")}
              className="border border-white text-white font-medium px-6 py-2 rounded-md hover:bg-neutral-800"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </main>
  );
}
