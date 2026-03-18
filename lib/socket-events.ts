// lib/socket-events.ts
import { toast } from "sonner";
import { ScopedMutator } from "swr/_internal";

/**
 * Maps WebSocket event types to SWR keys that should be revalidated.
 * Can be a single string, an array of strings, or a custom callback function.
 */
export const SOCKET_EVENT_MAP: Record<
  string,
  string | string[] | ((mutate: ScopedMutator, payload: any) => void)
> = {
  // Item events
  "items:created": (mutate) => {
    // Revalidate all keys starting with these paths
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/item/list-items"),
    );
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/transactions"),
    );
    mutate((key) => typeof key === "string" && key.startsWith("/api/stats"));
    mutate((key) => typeof key === "string" && key.startsWith("/api/reports/stock-movement"));
  },
  "items:updated": ["/api/item/list-items", "/api/stats"],
  "items:deleted": ["/api/item/list-items", "/api/stats"],
  "items:disabled": [
    "/api/item/list-items?disabled=true",
    "/api/item/list-items",
    "/api/stats",
  ],

  // Transaction events
  "transaction:created": (mutate) => {
    // Revalidate all keys starting with these paths
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/item/list-items"),
    );
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/transactions"),
    );
    mutate((key) => typeof key === "string" && key.startsWith("/api/stats"));
    mutate((key) => typeof key === "string" && key.startsWith("/api/reports/stock-movement"));
  },

  // Placeholder for future events
  "user:profile_updated": "/api/auth/session",
  "notifications:received": "/api/notifications/unread-count",

  // Example of a complex callback
  "order:shipped": (mutate, payload) => {
    mutate("/api/orders");
    mutate(`/api/orders/${payload.orderId}`);
    toast.info(`Order #${payload.orderId} is on the way!`);
  },
};
