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
  Filter,
  ChevronsLeft,
  ChevronsRight,
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { StockLog } from "./types";

interface StockMovementTableProps {
  logs?: StockLog[];
}

export function StockMovementTable({ logs = [] }: StockMovementTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<StockLog>[] = React.useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 text-[10px] uppercase font-bold tracking-wider"
          >
            Timestamp
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-[10px] text-muted-foreground uppercase">
            {format(new Date(row.getValue("createdAt")), "HH:mm:ss")}
          </div>
        ),
      },
      {
        id: "product",
        accessorFn: (row) => row.item.name,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 text-[10px] uppercase font-bold tracking-wider"
          >
            Product Node
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">
              {row.getValue("product")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              UID: {row.original.itemId.slice(0, 8)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "reason",
        header: () => (
          <span className="text-[10px] uppercase font-bold tracking-wider">
            Action
          </span>
        ),
        cell: ({ row }) => {
          const reason = row.getValue("reason") as StockLog["reason"];
          switch (reason) {
            case "SALE":
              return <Badge variant="success">SALE</Badge>;
            case "RESTOCK":
              return <Badge variant="destructive">RESTOCK</Badge>;
            case "CREATION":
              return <Badge variant="info">INITIAL</Badge>;
            case "MANUAL_ADJUSTMENT":
              return <Badge variant="warning">ADJUST</Badge>;
            default:
              return <Badge variant="outline">{reason}</Badge>;
          }
        },
      },
      {
        id: "executor",
        accessorFn: (row) => row.user.name,
        header: () => (
          <span className="text-[10px] uppercase font-bold tracking-wider">
            Executor
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">
              {row.getValue("executor")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              USR: {row.original.userId.slice(0, 8)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "change",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-mr-4 text-[10px] uppercase font-bold tracking-wider"
            >
              Delta
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const change = parseFloat(row.getValue("change"));
          return (
            <div className={`text-right font-mono font-bold ${change > 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {change > 0 ? `+${change}` : change}
            </div>
          );
        },
        enableGlobalFilter: false,
      },
      {
        accessorKey: "newStock",
        header: () => (
          <div className="text-right text-[10px] uppercase font-bold tracking-wider">
            New Stock
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono font-bold">
            {row.getValue("newStock")}
          </div>
        ),
        enableGlobalFilter: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: logs,
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
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          Inventory Journal
        </h3>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product or executor..."
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
                  No movements detected in journal.
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


