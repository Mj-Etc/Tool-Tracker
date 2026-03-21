'use client';

import { useEventHub } from "@/hooks/use-event-hub";

export function EventProvider({ children }: { children: React.ReactNode }) {
  useEventHub();
  return <>{children}</>;
}
