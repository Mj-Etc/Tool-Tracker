# Repository Flow Documentation

This document outlines the architectural flow and real-time data synchronization patterns used in the Tool Tracker application.

## Core Technologies
- **Next.js**: Framework using the App Router.
- **Better Auth**: Authentication and session management.
- **Prisma**: ORM for database operations.
- **SWR**: Client-side data fetching and caching.
- **next-ws**: WebSocket support within Next.js API routes.

---

## Real-Time Synchronization Flow

The application uses a "Broadcast-to-Revalidate" pattern to keep data synchronized across multiple clients in real-time.

### 1. Action Trigger (Client A)
A user performs an action (e.g., creating, updating, or deleting an item) using a client-side component like `CreateItem` or `DeleteItemButton`.

### 2. API Request
The component sends a standard HTTP request to a Next.js API route (e.g., `POST /api/item/create-item`).

### 3. Database Update
The API route uses Prisma to perform the requested operation in the database.

### 4. WebSocket Broadcast
Upon a successful API response, the client component uses the `useSocket` hook to broadcast a message through the global WebSocket connection:
```typescript
sendMessage({ type: 'items:created' });
```

### 5. Server-Side Routing
The WebSocket server (`app/api/ws/route.ts`) receives the message and broadcasts it to all other connected clients.

### 6. Centralized Event Dispatching (Client B)
The `SocketProvider` on all other clients receives the message. It looks up the event type in the `lib/socket-events.ts` registry.

### 7. Global State Update
Based on the registry, the app performs a specific action:
- **Mutate**: Triggers SWR's `mutate('/api/item/list-items')` to re-fetch data and update the UI.
- **Notifications**: Shows a global toast (via `sonner`) notifying the user of the update.

---

## Key Files & Directories

- `components/socket-provider.tsx`: Manages the WebSocket lifecycle and dispatches incoming messages.
- `lib/socket-events.ts`: Central registry for WebSocket events and their corresponding UI actions.
- `app/api/ws/route.ts`: Server-side WebSocket upgrade handler.
- `components/list-item.tsx`: Consumes real-time data using SWR.
