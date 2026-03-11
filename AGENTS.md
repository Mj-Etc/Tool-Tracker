AGENTS.md — Project System Instructions
🎯 Architecture Philosophy
This project uses a Layered Architecture. We strictly separate UI (Next.js), Orchestration (Actions/Routes), and Business Logic (Services).
📁 Directory Map
src/app/: UI & Routing. Components, layouts, and page.tsx. Keep logic minimal here.
src/actions/: Entry Points. Use for mutations. Validate inputs with Zod, check better-auth session, then call a service.
src/services/: The "Brain". Pure functions for math, business rules, and complex logic. Framework-agnostic.
src/lib/: Infrastructure. Prisma client, better-auth instance, and the Data Access Layer (DAL) for reusable queries.
src/schemas/: Validation. Shared Zod schemas for both Client (RHF) and Server (Actions).
src/hooks/: State. Custom SWR wrappers for data fetching and next-ws event listeners.
🛠️ Implementation Standards
1. Form Validation (React Hook Form + Zod)
Schema: Always define schemas in src/schemas/.
Inference: Use type FormSchema = z.infer<typeof schema> to avoid manual type definitions.
Error Handling: Map Zod issues to setError in React Hook Form using handleServerActionError utilities.
2. Database & Auth (Prisma + Better-Auth)
Client: Use a single global Prisma client from src/lib/db.ts.
DAL: Database calls should be wrapped in functions inside src/lib/dal.ts.
Rule: Never call prisma.user.findUnique directly in a page.tsx. Use getUserProfile(id).
Auth: Use auth.getSession() for server-side checks and the useSession() hook from better-auth for client-side UI toggles.
3. Real-time & Fetching (SWR + next-ws)
SWR: Use for any data that needs "Polling" or "Revalidation on Focus".
WebSockets: Use next-ws for push notifications or live math updates.
Sync Pattern: When a WebSocket message arrives, trigger an SWR refresh:
typescript
// Inside a custom hook
const { mutate } = useSWR('/api/data');
useWebSocket({ onMessage: () => mutate() });
Use code with caution.

4. Math & Business Logic (Services)
Purity: Functions in src/services/ must be "Pure". They take inputs and return outputs. No cookies(), headers(), or database calls inside them.
Orchestration: If a calculation needs DB data, the Action fetches the data from the DAL and passes it to the Service.
🚨 AI Rules & Constraints
No Logic in Pages: If a calculation is more than one line, move it to src/services/.
Type Safety: Every Server Action must have a validated input type via Zod.
Optimistic UI: For high-frequency actions, always implement useOptimistic or SWR's optimisticData.
Environment: This is a PostgreSQL environment. Use Prisma-compatible types.
Security: Always verify the session.userId matches the resource ownerId in the DAL or Action layer.
📝 Example Flow: "Update User Stats"
Schema: userUpdateSchema in src/schemas/user.ts.
Service: calculateNewLevel(xp: number) in src/services/leveling.ts.
DAL: updateUserRecord(id, data) in src/lib/dal.ts.
Action: updateUserAction validates, calls calculateNewLevel, then calls updateUserRecord.
UI: Form uses react-hook-form + zodResolver(userUpdateSchema)