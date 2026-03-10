"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
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

interface DeleteProps {
  itemId: string;
  endpoint: string;
}

export function DeleteItemButton({ itemId, endpoint }: DeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });

      if (!response.ok) {
        toast.error("Failed to delete item.", { duration: 2000 });
      }
      await mutate("/api/item/list-items");
      setOpen(false);
      toast.success("Deleted successfully!", { duration: 2000 });
    } catch (err) {
      toast.error("An unexpected error occurred.", { duration: 2000 });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            <Trash2 />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
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
                  <Spinner />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
