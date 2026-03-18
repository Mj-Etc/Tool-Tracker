I've modularized the ReportsPage by extracting its sub-sections into specialized components within the components/reports
directory, significantly simplifying the main page's code structure. The new modular architecture includes:

- types.ts: Shared TypeScript interfaces.
- report-skeleton.tsx: Loading state visualization.
- kpi-cards.tsx: Top-level metric cards (Revenue, Transactions, etc.).
- revenue-trend-chart.tsx: Period-based bar chart.
- financial-summary.tsx: Detailed COGS and profit breakdown.
- top-products.tsx: Hot sellers list.
- transaction-journal.tsx: Transaction ledger table.
- inventory-stats.tsx: Stock alerts and asset valuation.

The main ReportsPage now primarily serves as an orchestrator for state, data fetching, and high-level layout.
