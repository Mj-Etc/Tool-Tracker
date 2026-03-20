"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Notebook,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Transaction, ReportMode } from "./types";
import { TransactionReviewDialog } from "./transaction-review-dialog";

interface TransactionJournalProps {
  reportMode: ReportMode;
  selectedDate: Date;
  transactions?: Transaction[];
}

export function TransactionJournal({ reportMode, selectedDate, transactions = [] }: TransactionJournalProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);

  const handleReview = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReviewOpen(true);
  };

  const columns: ColumnDef<Transaction>[] = React.useMemo(
    () => [
      {
        id: "customer",
        accessorFn: (row) => row.customerName || "General Walk-in",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 text-[10px] uppercase font-bold tracking-wider"
          >
            Customer
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">
              {row.getValue("customer")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              TRX: {row.original.id.slice(0, 8)}
            </span>
          </div>
        ),
      },
      {
        id: "cashier",
        accessorFn: (row) => row.cashier.name,
        header: () => (
          <span className="text-[10px] uppercase font-bold tracking-wider">
            Cashier
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">
              {row.getValue("cashier")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "items",
        header: () => (
          <div className="text-right text-[10px] uppercase font-bold tracking-wider">
            Items
          </div>
        ),
        cell: ({ row }) => {
          const items = row.original.items;
          return <div className="text-right font-mono font-bold">{items.length}</div>;
        },
        enableGlobalFilter: false,
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-mr-4 text-[10px] uppercase font-bold tracking-wider"
            >
              Total
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("totalAmount"));
          return (
            <div className="text-right font-mono font-bold">
              ₱{amount.toLocaleString()}
            </div>
          );
        },
        enableGlobalFilter: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-mr-4 text-[10px] uppercase font-bold tracking-wider"
            >
              Date/Time
              <ArrowUpDown className="mr-2 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono text-[10px] text-muted-foreground uppercase">
            {reportMode === "daily" 
              ? format(new Date(row.getValue("createdAt")), "HH:mm") 
              : format(new Date(row.getValue("createdAt")), "MMM d, HH:mm")}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => (
          <div className="text-right text-[10px] uppercase font-bold tracking-wider">
            Action
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => handleReview(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [reportMode],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  return (
    <div className="w-full rounded-xl bg-card shadow-sm space-y-4 p-4">
      <TransactionReviewDialog
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        transaction={selectedTransaction}
      />
      <div className="text-base leading-snug font-medium group-data-[size=sm]/card:text-sm flex items-center gap-2">
        <Notebook className="h-5 w-5" />
        <h3>
          Journal Entry
        </h3>
        <p className="text-xs text-muted-foreground">
          {reportMode === "daily" ? `Transactions for ${format(selectedDate, "PPP")}` : "Transaction ledger"}
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer or cashier..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 bg-muted/20 border-muted-foreground/20 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[10px] uppercase font-bold tracking-wider px-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group hover:bg-muted/10 transition-colors border-b last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground italic"
                >
                  No transactions found in journal.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-2 px-1">
        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-bold tracking-widest"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-bold tracking-widest"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


