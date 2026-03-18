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
