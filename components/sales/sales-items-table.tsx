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
  RowData,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    quantities: Record<string, number>;
    onQuantityChange: (itemId: string, val: string) => void;
    onAddToCart: (item: ItemWithUser) => void;
  }
}

import {
  ArrowUpDown,
  Search,
  Plus,
  CircleDollarSign,
  Boxes,
  ChevronsLeft,
  ChevronsRight,
  Package,
  PhilippinePeso,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { ItemWithUser } from "@/components/items/types";

interface SalesItemsTableProps {
  data: ItemWithUser[];
  quantities: Record<string, number>;
  onQuantityChange: (itemId: string, val: string) => void;
  onAddToCart: (item: ItemWithUser) => void;
}

export function SalesItemsTable({ 
  data, 
  quantities, 
  onQuantityChange, 
  onAddToCart 
}: SalesItemsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<ItemWithUser>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
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
            <span className="font-bold tracking-tight">{row.getValue("name")}</span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-mono">
              <Package className="h-2 w-2" /> {row.original.category?.name} / {row.original.subcategory?.name}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 text-[10px] uppercase font-bold tracking-wider"
          >
            Unit Price
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("price"));
          const formatted = new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(amount);
          return (
            <div className="flex items-center gap-1 font-mono font-bold text-emerald-600">
              <PhilippinePeso className="h-3 w-3 opacity-70" />
              {formatted}
            </div>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 text-[10px] uppercase font-bold tracking-wider"
          >
            Stock Level
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const threshold = row.original.lowStockThreshold;

          let statusLabel = "Optimal";
          let statusColor = "bg-green-400 text-green-900 font-bold hover:bg-green-400/90";

          if (quantity === 0) {
            statusLabel = "Depleted";
            statusColor = "bg-destructive text-red-900 font-bold hover:bg-destructive/90";
          } else if (quantity <= threshold) {
            statusLabel = "Critical";
            statusColor = "bg-yellow-400 text-yellow-900 font-bold hover:bg-yellow-400/90";
          }

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 font-mono text-sm font-bold">
                <Boxes className="h-3 w-3 text-muted-foreground" />
                <span className={quantity === 0 ? "text-destructive" : quantity <= threshold ? "text-yellow-500" : ""}>
                  {quantity} <span className="text-[10px] uppercase font-normal text-muted-foreground tracking-tighter">Units</span>
                </span>
              </div>
              <Badge className={`${statusColor} text-[9px] py-0 h-3.5 w-fit uppercase tracking-tighter px-1.5`}>
                {statusLabel}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "orderQty",
        header: () => <span className="text-[10px] uppercase font-bold tracking-wider">Order Qty</span>,
        cell: ({ row, table }) => {
          const item = row.original;
          const meta = table.options.meta;
          return (
            <Input 
              type="number" 
              min="1" 
              max={item.quantity}
              placeholder="Qty"
              value={meta?.quantities[item.id] || ""}
              onChange={(e) => meta?.onQuantityChange(item.id, e.target.value)}
              disabled={item.quantity <= 0}
              className="w-20 text-center font-bold h-8 text-xs bg-muted/20"
            />
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="text-[10px] uppercase font-bold tracking-wider">Action</span>,
        cell: ({ row, table }) => {
          const item = row.original;
          const meta = table.options.meta;
          const qtyToAdd = meta?.quantities[item.id] || 1;
          return (
            <Button 
              size="sm" 
              onClick={() => meta?.onAddToCart(item)}
              disabled={item.quantity <= 0 || qtyToAdd <= 0}
              className="h-8 px-3 bg-primary hover:bg-primary/90 text-[10px] uppercase font-bold tracking-widest"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      quantities,
      onQuantityChange,
      onAddToCart,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search product nodes by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="pl-9 bg-muted/20 border-muted-foreground/20"
        />
      </div>

      {/* Table Content */}
      <div className="rounded-md border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 text-[10px] uppercase font-bold tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground italic">
                  No product nodes detected in cluster.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2">
        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            className="h-7 w-7 p-0" 
            onClick={() => table.setPageIndex(0)} 
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2 text-[10px] uppercase font-bold tracking-widest" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2 text-[10px] uppercase font-bold tracking-widest" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button 
            variant="outline" 
            className="h-7 w-7 p-0" 
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} 
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
