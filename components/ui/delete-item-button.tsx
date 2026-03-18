"use client";

import { useState } from "react";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog";
import { useSocket } from "../socket-provider";

interface DeleteProps {
  ids: string[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function DeleteItemButton({
  ids,
  onSuccess,
  trigger,
  variant = "destructive",
  size = "sm",
  className,
  disabled
}: DeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { sendMessage } = useSocket();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/item/batch-permanent-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete item.");
      }
      
      sendMessage({ type: "items:deleted" });
      setOpen(false);
      toast.success(`Successfully deleted ${ids.length} item(s) permanently`);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant={variant}
            size={size}
            className={className || "w-full flex items-center justify-center gap-2"}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete {ids.length === 1 ? "the item" : `${ids.length} items`} and remove all its records.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
