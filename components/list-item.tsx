"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search, PowerOff, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { Checkbox } from "@/components/ui/checkbox";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Spinner } from "./ui/spinner";
import { DisableItemButton } from "./ui/disable-item-button";
import { useSession } from "@/lib/auth-client";
import { Badge } from "./ui/badge";
import { EditItemDialog } from "./edit-item-dialog";
import { useSocket } from "./socket-provider";
import { toast } from "sonner";

type ItemWithUser = {
  id: string;
  name: string;
  description: string;
  costPrice: number;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
};

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export function ListItem() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";
  const { sendMessage } = useSocket();
  const { data, error, isLoading, mutate } = useSWR<ItemWithUser[]>(
    `/api/item/list-items`,
    fetcher,
  );
  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isBatchProcessing, setIsBatchProcessing] = React.useState(false);

  const columns: ColumnDef<ItemWithUser>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              Product Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        id: "category_name",
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit">{row.original.category?.name}</Badge>
            <span className="text-[10px] text-muted-foreground ml-1">{row.original.subcategory?.name}</span>
          </div>
        ),
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          return row.original.category?.id === value;
        },
      },
      {
        id: "subcategory_name",
        accessorKey: "subcategory.name",
        header: "Subcategory",
        cell: ({ row }) => row.original.subcategory?.name,
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          return row.original.subcategory?.id === value;
        },
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("price"));
          const formatted = new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(amount);
          return <div className="font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Stock
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const threshold = row.original.lowStockThreshold;
          
          let statusLabel = "In Stock";
          let statusColor = "bg-green-500 hover:bg-green-600";
          
          if (quantity === 0) {
            statusLabel = "Out of Stock";
            statusColor = "bg-red-500 hover:bg-red-600";
          } else if (quantity <= threshold) {
            statusLabel = "Low Stock";
            statusColor = "bg-yellow-500 hover:bg-yellow-600";
          }

          return (
            <div className="flex flex-col gap-1">
              <span className={quantity <= threshold ? "text-red-500 font-bold" : ""}>
                {quantity} units
              </span>
              <Badge className={`${statusColor} text-[10px] py-0 h-4 w-fit`}>{statusLabel}</Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return <ActionsCell item={item} isAdmin={isAdmin} />;
        },
      },
    ],
    [isAdmin]
  );

  const table = useReactTable({
    data: data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBatchDisable = async () => {
    if (selectedCount === 0) return;
    
    setIsBatchProcessing(true);
    const ids = selectedRows.map(row => row.original.id);
    
    try {
      const response = await fetch("/api/item/batch-toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isActive: false }),
      });
      
      if (!response.ok) throw new Error("Batch disable failed");
      
      toast.success(`Successfully disabled ${selectedCount} items`);
      sendMessage({ type: "items:updated" });
      table.resetRowSelection();
      mutate();
    } catch (error) {
      toast.error("Failed to disable items");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const selectedCategory = (table.getColumn("category_name")?.getFilterValue() as string) ?? "all";
  const availableSubcategories = categories?.find(c => c.id === selectedCategory)?.subcategories || [];

  if (error) return <div className="p-4 text-center text-red-500">Failed to load items.</div>;
  if (isLoading) return <div className="p-8 flex justify-center"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Filter className="h-4 w-4" />
                {selectedCategory === "all" 
                  ? "Filter by Category" 
                  : categories?.find(c => c.id === selectedCategory)?.name}
                {!!table.getColumn("subcategory_name")?.getFilterValue() && (
                  <span className="text-muted-foreground font-normal">
                    / {categories?.find(c => c.id === selectedCategory)?.subcategories.find(s => s.id === table.getColumn("subcategory_name")?.getFilterValue())?.name}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  table.getColumn("category_name")?.setFilterValue("");
                  table.getColumn("subcategory_name")?.setFilterValue("");
                }}
              >
                All Categories
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories?.map((cat) => (
                cat.subcategories && cat.subcategories.length > 0 ? (
                  <DropdownMenuSub key={cat.id}>
                    <DropdownMenuSubTrigger>
                      {cat.name}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() => {
                            table.getColumn("category_name")?.setFilterValue(cat.id);
                            table.getColumn("subcategory_name")?.setFilterValue("");
                          }}
                        >
                          All {cat.name}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {cat.subcategories.map((sub) => (
                          <DropdownMenuItem
                            key={sub.id}
                            onClick={() => {
                              table.getColumn("category_name")?.setFilterValue(cat.id);
                              table.getColumn("subcategory_name")?.setFilterValue(sub.id);
                            }}
                          >
                            {sub.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => {
                      table.getColumn("category_name")?.setFilterValue(cat.id);
                      table.getColumn("subcategory_name")?.setFilterValue("");
                    }}
                  >
                    {cat.name}
                  </DropdownMenuItem>
                )
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
                .map((column) => {
                  return (
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
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {selectedCount > 0 && isAdmin && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-top-1">
          <span className="text-sm font-medium ml-2">{selectedCount} row(s) selected</span>
          <div className="ml-auto flex gap-2">
            {selectedCount === 1 && (
              <div className="flex gap-2">
                <EditItemDialog item={selectedRows[0].original} />
              </div>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleBatchDisable}
              disabled={isBatchProcessing}
            >
              {isBatchProcessing ? <Spinner className="mr-2 h-4 w-4" /> : <PowerOff className="mr-2 h-4 w-4" />}
              {selectedCount === 1 ? "Disable Item" : `Disable ${selectedCount} Items`}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-xs text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} total items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
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

function ActionsCell({ item, isAdmin }: { item: ItemWithUser; isAdmin: boolean }) {
  const [open, setOpen] = React.useState(false);

  if (!isAdmin) return null;

  return (
    <div className="flex justify-end">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-1">
            <EditItemDialog item={item} onSuccess={() => setOpen(false)} />
          </div>
          <div className="p-1">
            <DisableItemButton itemId={item.id} onSuccess={() => setOpen(false)} />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
