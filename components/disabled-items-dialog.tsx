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
import { 
  ArrowUpDown, 
  ChevronDown, 
  MoreHorizontal, 
  Search, 
  RotateCcw, 
  Trash2, 
  Archive, 
  Filter,
  CheckCircle2
} from "lucide-react";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { useSocket } from "./socket-provider";
import { ScrollArea } from "./ui/scroll-area";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Item {
  id: string;
  name: string;
  category: Category;
  subcategory: Subcategory;
}

export function DisabledItemsDialog() {
  const [open, setOpen] = React.useState(false);
  const { sendMessage } = useSocket();
  const { data: items, mutate, isLoading } = useSWR<Item[]>("/api/item/list-items?disabled=true", fetcher);
  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleRestore = async (ids: string[]) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/item/batch-toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isActive: true }),
      });

      if (!response.ok) throw new Error("Failed to restore items");

      toast.success(`Successfully restored ${ids.length} item(s)`);
      sendMessage({ type: "items:updated" });
      setRowSelection({});
      mutate();
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete ${ids.length} item(s)? This action cannot be undone.`)) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch("/api/item/batch-permanent-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error("Failed to delete items");

      toast.success(`Successfully deleted ${ids.length} item(s) permanently`);
      sendMessage({ type: "items:deleted" });
      setRowSelection({});
      mutate();
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: ColumnDef<Item>[] = React.useMemo(
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium truncate max-w-37.5">{row.getValue("name")}</div>,
      },
      {
        id: "category_name",
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs font-medium">{row.original.category?.name}</span>
            <span className="text-[10px] text-muted-foreground">{row.original.subcategory?.name}</span>
          </div>
        ),
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          return row.original.category?.id === value;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return <ActionsCell row={row} handleRestore={handleRestore} handlePermanentDelete={handlePermanentDelete} />;
        },
      },
    ],
    [handleRestore, handlePermanentDelete]
  );

  const table = useReactTable({
    data: items || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedCategory = (table.getColumn("category_name")?.getFilterValue() as string) ?? "all";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Archive size={16} className="mr-2" />
          Archive
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Disabled Items Archive</DialogTitle>
          <DialogDescription>
            Manage items that have been disabled. You can restore them to the active list or permanently delete them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="pl-9 h-9"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Filter className="h-4 w-4" />
                  {selectedCategory === "all" 
                    ? "Category" 
                    : categories?.find(c => c.id === selectedCategory)?.name}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-50">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup 
                  value={selectedCategory} 
                  onValueChange={(value) => {
                    table.getColumn("category_name")?.setFilterValue(value === "all" ? "" : value);
                  }}
                >
                  <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                  {categories?.map((cat) => (
                    <DropdownMenuRadioItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-top-1">
              <span className="text-xs font-medium ml-2">{selectedCount} selected</span>
              <div className="ml-auto flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={() => handleRestore(selectedRows.map(r => r.original.id))}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Spinner className="mr-1 h-3 w-3" /> : <RotateCcw className="mr-1 h-3 w-3" />}
                  Restore
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={() => handlePermanentDelete(selectedRows.map(r => r.original.id))}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Spinner className="mr-1 h-3 w-3" /> : <Trash2 className="mr-1 h-3 w-3" />}
                  Delete
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="max-h-75 pr-4">
            <div className="rounded-md border bg-background">
            {/* <div className="rounded-md border bg-background overflow-hidden"> */}
              <div className="">
                <Table>
                  <TableHeader className="sticky top-0">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          <Spinner className="mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-2">
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
                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">
                          No disabled items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex items-center justify-between px-2">
            <div className="text-[10px] text-muted-foreground">
              Total: {table.getFilteredRowModel().rows.length} items
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionsCell({ row, handleRestore, handlePermanentDelete }: { row: any, handleRestore: (ids: string[]) => void, handlePermanentDelete: (ids: string[]) => void }) {
  const item = row.original;
  const isSelected = row.getIsSelected();

  if (isSelected) {
    return null;
  }
  
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleRestore([item.id])}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handlePermanentDelete([item.id])}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
