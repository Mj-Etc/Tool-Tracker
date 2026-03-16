"use client";

import { useState } from "react";
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
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { IconRotateDot, IconTrash, IconArchive } from "@tabler/icons-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useSocket } from "./socket-provider";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  category: Category;
  subcategory: Subcategory;
}

export function DisabledItemsDialog() {
  const [open, setOpen] = useState(false);
  const { sendMessage } = useSocket();
  const { data: items, mutate, isLoading } = useSWR<Item[]>("/api/item/list-items?disabled=true", fetcher);
  const [actionId, setActionId] = useState<string | null>(null);

  const handleToggle = async (id: string, active: boolean) => {
    setActionId(id);
    try {
      const response = await fetch("/api/item/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: active }),
      });

      if (!response.ok) throw new Error("Failed to restore item");

      toast.success("Item restored successfully!");
      sendMessage({ type: "items:updated" });
      mutate();
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setActionId(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this item? This action cannot be undone.")) return;
    
    setActionId(id);
    try {
      const response = await fetch("/api/item/permanent-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete item");

      toast.success("Item permanently deleted!");
      sendMessage({ type: "items:deleted" });
      mutate();
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconArchive size={16} className="mr-2" />
          Archive
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Disabled Items Archive</DialogTitle>
          <DialogDescription>
            Manage items that have been disabled. You can restore them to the active list or permanently delete them.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] mt-4 pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic">
              No disabled items in the archive.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">{item.name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px]">{item.category?.name}</Badge>
                      <Badge variant="outline" className="text-[10px] font-normal opacity-70">{item.subcategory?.name}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleToggle(item.id, true)}
                      disabled={actionId === item.id}
                    >
                      {actionId === item.id ? <Spinner className="h-3 w-3" /> : <IconRotateDot size={14} className="mr-1" />}
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs"
                      onClick={() => handlePermanentDelete(item.id)}
                      disabled={actionId === item.id}
                    >
                      {actionId === item.id ? <Spinner className="h-3 w-3" /> : <IconTrash size={14} className="mr-1" />}
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
