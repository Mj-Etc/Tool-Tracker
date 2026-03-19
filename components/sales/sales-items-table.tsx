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
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

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
  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher);

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
            Product
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight">{row.getValue("name")}</span>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-mono">
              {row.original.category?.name}
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
            Price
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("price"));
          return (
            <div className="font-mono font-semibold text-sm">
              ₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
            Stock
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const threshold = row.original.lowStockThreshold;

          let colorClass = "text-emerald-600";
          if (quantity === 0) colorClass = "text-destructive";
          else if (quantity <= threshold) colorClass = "text-yellow-600";

          return (
            <div className={`font-mono text-sm font-semibold ${colorClass}`}>
              {quantity}
            </div>
          );
        },
      },
      {
        accessorKey: "category.name",
        id: "categoryName",
        header: () => null,
        cell: () => null,
        enableHiding: true,
      },
      {
        id: "actions",
        header: () => <span className="text-[10px] uppercase font-bold tracking-wider text-center block">Action</span>,
        cell: ({ row, table }) => {
          const item = row.original;
          const meta = table.options.meta;
          const qtyToAdd = meta?.quantities[item.id] || 1;
          return (
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                min="1" 
                max={item.quantity}
                placeholder="1"
                value={meta?.quantities[item.id] || ""}
                onChange={(e) => meta?.onQuantityChange(item.id, e.target.value)}
                disabled={item.quantity <= 0}
                className="w-14 text-center font-semibold h-7 text-xs bg-muted/20 px-1"
              />
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => meta?.onAddToCart(item)}
                disabled={item.quantity <= 0 || (meta?.quantities[item.id] || 1) <= 0}
                className="h-7 w-7 p-0 rounded-full"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
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
        pageSize: 8,
      }
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="pl-8 h-9 text-sm bg-muted/10 border-muted-foreground/10"
          />
        </div>
        <Select 
          onValueChange={(val) => {
            const filterValue = val === "all" ? "" : val;
            table.getColumn("categoryName")?.setFilterValue(filterValue);
          }}
        >
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-8 py-0">
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
                  className="hover:bg-muted/5 border-b last:border-0 h-11"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-muted-foreground italic text-sm">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] uppercase font-bold" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] uppercase font-bold" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
