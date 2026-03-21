🧩 Modularization Prompt

Objective: Refactor the Items page at app/admin/dashboard/items into a modular Orchestrator-Component architecture to improve
readability and maintainability.

Follow these structural rules:

1.  Create a Component Directory: Create a new folder at components/[page-name]/ to house all sub-components.
2.  Centralize Types: Extract all interfaces and types into components/[page-name]/types.ts. Ensure these types are  
    shared across the orchestrator and all sub-components.
3.  Extract Presentational Components: Identify logical UI sections (e.g., Headers, Data Tables, Charts, Modals, Summary
    Cards) and move them into individual files within the new component directory.
    - Each component should be "dumb" (presentational), receiving data and callbacks via props.
    - Use descriptive names like [Feature]Table.tsx, [Feature]Header.tsx, or [Feature]Stats.tsx.
4.  Isolate the Loading State: Move the skeleton or loading UI into components/[page-name]/[page-name]-skeleton.tsx.
5.  Refactor the Orchestrator (The Page): Rewrite the main page.tsx to act as the "Smart Container":
    - Data Fetching: Use useSWR or your preferred data fetching hook at the top level.
    - State Management: Keep all shared state (filters, selected IDs, modal visibility) here.
    - Business Logic: Use useMemo to perform data transformations, calculations, or filtering before passing data down  
      to components.
    - Layout: Use the extracted components to build the page structure, keeping the JSX clean and high-level.

Coding Standards:

- Adhere to existing UI patterns using Shadcn/Radix components (Card, Tabs, Table, etc.).
- Ensure all extracted components are properly typed using the central types.ts.
- Maintain the same functionality and styling as the original page.

---

When to use this:

- Page is > 300 lines: If you find yourself scrolling for a long time to find a specific UI fix.
- Deep Nesting: If your JSX is more than 5-6 levels deep (e.g., Tabs > Content > Grid > Card > Table).
- Mixed Concerns: If API fetching, complex math, and 200 lines of HTML-like code are all in the same function.

----- TABLE PROMPT -----

Act as a Senior Frontend Engineer. Create/Remodel a Next.js client component for a [NAME_OF_ENTITY] table using TanStack Table v8 and Shadcn UI components.

### Core Architecture:

1. **State Management**: Implement sorting, column filters, column visibility, and row selection using `useReactTable`.

2. **Data Handling**: The table should accept `data` as a prop and an `onUpdate` callback for refreshing data after actions.

3. **Column Definitions**:
   - **Selection**: A checkbox column for bulk actions.
   - **Primary Info**: A density-optimized cell showing [PRIMARY_FIELD] in bold and [SECONDARY_FIELD] in a small, mono-spaced uppercase sub-label with an icon.
   - **Categorization**: A Badge-based column for [CATEGORY/ROLE] using different variants based on value (eg., 'default' for high-priority, 'secondary' for others).
   - **Activity/Stats**: A multi-stat cell showing counts or metrics with Lucide icons (e.g., Lucide [ICON_NAME]).
   - **Temporal**: A 'Node Created' column showing a formatted date and time in a vertical mono-spaced stack.
   - **Status**: A Badge-based status indicator (e.g., Active/Inactive).
   - **Actions**: A trailing 'Actions' column with a DropdownMenu for row-specific operations.

### UI & Aesthetic Guidelines:

    - **Table Styling**: Use `bg-muted/30` for the TableHeader. Rows should have a subtle hover effect

(`hover:bg-muted/10`). - **Typography**: Labels, headers, and metadata should use `text-[10px] uppercase font-bold tracking-wider`. - **Toolbar**: Include a Search input (pl-9 with a Search icon) and a "Filter by [CATEGORY]" DropdownMenu. - **Batch Actions**: Implement a conditional "Batch Action" bar that slides in when rows are selected, allowing for bulk [ACTION_NAME]. - **Dialogs**: All destructive actions (like Delete/Purge) must be wrapped in a Shadcn Dialog for confirmation, including a Spinner for loading states. - **Pagination**: Standard pagination footer with "Page X of Y" and navigation buttons (First, Prev, Next, Last).

### Tech Stack:

- React (Client Component)
- TanStack Table v8 (@tanstack/react-table)
- Lucide React (Icons)

How to use this prompt:

1. Replace the placeholders in [...] (like [NAME_OF_ENTITY]) with your specific domain data (e.g., "Items", "Transactions", "Products").
2. Provide your specific TypeScript interface for the data to ensure the AI generates correct accessor keys.

Implementing a daily report for inventory is a valuable consideration, but its necessity depends on what you want to
track. Based on the current codebase, here is an analysis of the existing system and how a daily report could fit in:

Current Implementation

- Real-time Snapshot: The "Inventory" tab in the reports already provides a real-time view of Stock Alerts (low stock)
  and Asset Valuation (total liquidity vs. cost).
- Static Data: Currently, inventory stats (like totalItems, totalInventoryValue) in api/stats are calculated from the
  current state of the item table. They do not change when you toggle the "Daily/Weekly/Monthly" filters because the
  system doesn't store historical snapshots of stock levels.

Proposed: "Inventory Movement" (Daily Report)
Instead of just a static snapshot, a Daily Inventory Movement report would be highly beneficial for audits. This would
track:

1.  Stock-In: New items added or restocked today.
2.  Stock-Out: Items sold (already tracked via transactions) or manually removed/damaged.
3.  Opening/Closing Balance: What you started with at 8:00 AM vs. what you have at 5:00 PM.

Recommendation
If you decide to proceed, I recommend implementing an "Inventory Journal" or "Audit Log".

Why?

- Theft Prevention: It helps reconcile physical stock with system records.
- Trend Analysis: You can see if inventory value is growing or shrinking over time.

How to implement?

1.  Schema Change: Add a StockLog table to record every time a quantity changes (who, when, why, and how much).
2.  UI Update: Add a sub-section in the "Inventory" tab of the Reports page to list these "Movements" filtered by the
    selected date.

Decision:
Would you like me to:

1.  Plan a Stock Log system to track daily movements?
2.  Add a "Daily Snapshot" (even if simulated for now) to the existing Inventory tab?
3.  Leave it as is, as the "Stock Alerts" already handle immediate needs?

Remodel Journal Entry Card
@C:\Users\Flash\Documents\Projects\tool-tracker\components\reports\transaction-journal.tsx and Inventory Journal  
@C:\Users\Flash\Documents\Projects\tool-tracker\components\reports\stock-movement-table.tsx with a table. Check and  
review @C:\Users\Flash\Documents\Projects\tool-tracker\components\items\items-table.tsx ui that whould be youre
reference. Dont add any additional uis like icons stick with items-table design for a ui consistency for this app.  
Make me proud partner!

I've analyzed the current codebase and proposed a comprehensive plan for implementing a Restocking Workflow. This strategy ensures  
 consistency across the dashboard while providing both surgical and batch tools for inventory management.

Restocking Implementation Plan

1. Core Infrastructure (API)

- New Endpoint: POST /api/item/restock
- Behavior:
  - Accepts a list of items and their restock quantities.
  - Uses a Prisma Transaction to ensure data integrity.
  - For each item: Updates the quantity and creates a StockLog entry with the reason "RESTOCK".
  - Broadcasts a socket event (items:updated) to refresh all connected clients.

2. UI Components (The Experience)

- RestockItemDialog: A specialized dialog that handles two modes:
  - Single-Item: Triggered from an item's row dropdown.
  - Batch-Restock: Triggered from the batch actions bar when multiple items are selected. This allows a user to "Stock In" an entire  
    shipment in one go.
- Table Integration: Add the "Restock" action to the ActionsCell in ItemsTable.

3. Strategic Placement (Dashboard Integration)

- Dashboard Overview: The "Low Stock" and "Out of Stock" cards will become interactive links.
- Navigation: Clicking these cards will jump the user to the Items page with a pre-applied filter (e.g., ?status=low-stock).
- Direct Action: This turns reports into actionable insights—admins see an alert and are one click away from the restocking tool.

Proposed Technical Flow:

1.  Admin sees a "Low Stock" alert on the main dashboard.
2.  Admin clicks the alert, navigating to the Inventory list filtered for low stock.
3.  Admin selects the items they just received from a supplier.
4.  Admin clicks "Restock Selected", enters the quantities, and confirms.
5.  System updates quantities, logs the movement, and notifies the team in real-time.

---

Does this implementation path meet your expectations?
If so, I can begin by creating the restock API endpoint and the RestockItemDialog component. I'm ready to make you proud, partner!

## Migrate to SSE + SWR

Context:
I have a Next.js project currently using next-ws (WebSockets) combined with SWR for real-time updates. I want to refactor this to use
Server-Sent Events (SSE) instead of WebSockets, while keeping SWR for the data fetching and cache management.

Objective:
Remove the WebSocket implementation and replace it with a lightweight SSE system that broadcasts "mutate" signals to the client. When the
client receives a signal, it should trigger SWR to re-fetch the data.

Specific Implementation Plan:

1.  Remove next-ws: Uninstall the package and remove the WebSocket server setup from server.ts or next.config.js.
2.  Create an Event Hub (lib/hub.ts):
    - Implement a singleton class extending EventEmitter.
    - It needs broadcast(event, data) and subscribe(callback) methods.
    - This will act as the bridge between your API routes and the SSE stream.
3.  Create the SSE Endpoint (app/api/events/route.ts):
    - Create a GET route that returns a Response with a ReadableStream.
    - Headers must be: Content-Type: text/event-stream, Connection: keep-alive, Cache-Control: no-cache.
    - It should subscribe to the EventHub and write messages to the stream (format: data: ...\n\n).
    - Implement a heartbeat (ping) every 30 seconds to keep the connection alive.
    - Ensure proper cleanup (unsubscribe) on stream cancel/abort.
4.  Create a Client Hook (hooks/use-event-hub.ts):
    - Create a custom hook that connects to /api/events using new EventSource().
    - Listen for a custom event named 'mutate'.
    - When a message arrives, parse the JSON and use SWR's global mutate(key) function to revalidate the specific data key sent from the
      server.
5.  Update API Routes:
    - In your existing mutation routes (POST/PUT/DELETE), replace the WebSocket broadcast calls with eventHub.broadcast('mutate', { key:
      '/api/resource-url' }).

Reference Code Patterns:

Use these exact patterns for the core logic:

1. lib/hub.ts

   import { EventEmitter } from 'events';

   class EventHub extends EventEmitter {
   private static instance: EventHub;
   public static getInstance(): EventHub {
   if (!EventHub.instance) EventHub.instance = new EventHub();
   return EventHub.instance;
   }
   public broadcast(event: string, data: any) {

this.emit('message', { event, data });
}
public subscribe(cb: (msg: any) => void) {
this.on('message', cb);
return () => this.off('message', cb);
}
}
export const eventHub = EventHub.getInstance();

2. hooks/use-event-hub.ts

   'use client';
   import { useEffect } from 'react';
   import { useSWRConfig } from 'swr';

   export function useEventHub() {
   const { mutate } = useSWRConfig();
   useEffect(() => {
   const es = new EventSource('/api/events');
   es.addEventListener('mutate', (e) => {

const { key } = JSON.parse(e.data);
if (key) mutate(key);
});
return () => es.close();
}, [mutate]);
}

Please refactor my codebase to match this architecture. Start by creating the lib/hub.ts file.
