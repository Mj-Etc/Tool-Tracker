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
  "items:created": ["/api/item/list-items", "/api/stats"],
  "items:updated": ["/api/item/list-items", "/api/stats"],
  "items:deleted": ["/api/item/list-items", "/api/stats"],
  "items:disabled": ["/api/item/list-items?disabled=true"],

  // Transaction events
  "transaction:created": [
    "/api/item/list-items",
    "/api/transactions",
    "/api/stats",
  ],

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
