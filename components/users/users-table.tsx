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
  MoreHorizontal,
  Search,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserMinus,
  Mail,
  Calendar,
  Receipt,
  Package,
  Filter,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { UserWithCounts } from "./types";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface UsersTableProps {
  data: UserWithCounts[];
  onUpdate: () => void;
}

export function UsersTable({ data, onUpdate }: UsersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [isBatchProcessing, setIsBatchProcessing] = React.useState(false);
  const [isBatchPurgeDialogOpen, setIsBatchPurgeDialogOpen] =
    React.useState(false);

  const toggleBan = async (user: UserWithCounts) => {
    try {
      if (user.banned) {
        await authClient.admin.unbanUser({ userId: user.id });
        toast.success(`${user.name} access restored`);
      } else {
        await authClient.admin.banUser({ userId: user.id });
        toast.success(`${user.name} access suspended`);
      }
      onUpdate();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const columns: ColumnDef<UserWithCounts>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            className="ml-1.5"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="ml-1.5"
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
            Personnel Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold tracking-tight">
              {row.getValue("name")}
            </span>
            <div className="flex items-center text-[10px] text-muted-foreground font-mono">
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Access Level
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          return (
            <Badge
              variant={role === "admin" ? "default" : "secondary"}
              className="uppercase text-[10px] font-bold tracking-widest px-2"
            >
              {role}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          return row.getValue(id) === value;
        },
      },
      {
        id: "activity",
        header: "Operational Activity",
        cell: ({ row }) => (
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                Sales
              </span>
              <div className="flex items-center gap-1 font-bold text-sm">
                {row.original._count.transactions}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                Inventory
              </span>
              <div className="flex items-center gap-1 font-bold text-sm">
                {row.original._count.items}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Node Created",
        cell: ({ row }) => (
          <div className="flex flex-col text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-1 uppercase">
              {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
            </div>
            <span>
              {format(new Date(row.getValue("createdAt")), "HH:mm:ss")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "banned",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.banned ? "destructive" : "success"}
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            {row.original.banned ? "Suspended" : "Active"}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;
          const isSelected = row.getIsSelected();
          return (
            <ActionsCell
              user={user}
              isSelected={isSelected}
              onToggleBan={() => toggleBan(user)}
              onPurge={() => onUpdate()}
            />
          );
        },
      },
    ],
    [onUpdate],
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

  const handleBatchPurge = async () => {
    setIsBatchProcessing(true);
    const ids = selectedRows.map((row) => row.original.id);

    try {
      let successCount = 0;
      for (const userId of ids) {
        const { error } = await authClient.admin.removeUser({ userId });
        if (!error) successCount++;
      }

      toast.success(`Successfully purged ${successCount} personnel nodes`);
      onUpdate();
      table.resetRowSelection();
    } catch (err) {
      toast.error("Batch purge failed");
    } finally {
      setIsBatchProcessing(false);
      setIsBatchPurgeDialogOpen(false);
    }
  };

  const selectedRole =
    (table.getColumn("role")?.getFilterValue() as string) ?? "all";

  return (
    <div className="w-full space-y-4 p-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search personnel..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-9 bg-muted/20"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Filter className="h-4 w-4" />
                {selectedRole === "all"
                  ? "All Access Levels"
                  : `Level: ${selectedRole.toUpperCase()}`}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => table.getColumn("role")?.setFilterValue("")}
              >
                All Personnel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => table.getColumn("role")?.setFilterValue("admin")}
              >
                Admins Only
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  table.getColumn("role")?.setFilterValue("cashier")
                }
              >
                Cashiers Only
              </DropdownMenuItem>
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

      {/* Batch Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-top-1">
          <span className="text-sm font-medium ml-2">
            {selectedCount} personnel selected
          </span>
          <div className="ml-auto flex gap-2">
            <Dialog
              open={isBatchPurgeDialogOpen}
              onOpenChange={setIsBatchPurgeDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isBatchProcessing}
                  className="text-destructive hover:text-destructive/70"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Purge {selectedCount} Nodes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                    Confirm Batch Personnel Purge
                  </DialogTitle>
                  <DialogDescription>
                    This will permanently remove access for {selectedCount}{" "}
                    selected users. This action is irreversible and will purge
                    all node data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleBatchPurge}
                    disabled={isBatchProcessing}
                  >
                    {isBatchProcessing && <Spinner className="mr-2 h-4 w-4" />}{" "}
                    Confirm Purge
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetRowSelection()}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="rounded-md border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[10px] uppercase font-bold tracking-wider"
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
                  data-state={row.getIsSelected() && "selected"}
                  className="group hover:bg-muted/10 transition-colors border-b last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  No personnel detected in cluster.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-xs text-muted-foreground">
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

function ActionsCell({
  user,
  isSelected,
  onToggleBan,
  onPurge,
}: {
  user: UserWithCounts;
  isSelected: boolean;
  onToggleBan: () => void;
  onPurge: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (isSelected) return null;

  const handlePurge = async () => {
    setIsProcessing(true);
    try {
      const { error } = await authClient.admin.removeUser({ userId: user.id });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Personnel node purged");
        onPurge();
      }
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsProcessing(false);
      setIsPurgeDialogOpen(false);
    }
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Node Operations
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onToggleBan}>
            {user.banned ? (
              <>
                <UserCheck className="mr-2 h-4 w-4" /> Restore
                Access
              </>
            ) : (
              <>
                <UserMinus className="mr-2 h-4 w-4" /> Suspend
                Access
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsPurgeDialogOpen(true)}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Purge Node
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isPurgeDialogOpen} onOpenChange={setIsPurgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Purge Personnel Node?
            </DialogTitle>
            <DialogDescription>
              This will permanently remove access for {user.name}. This action
              is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handlePurge}
              disabled={isProcessing}
            >
              {isProcessing && <Spinner className="mr-2 h-3 w-3" />} Confirm
              Purge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
