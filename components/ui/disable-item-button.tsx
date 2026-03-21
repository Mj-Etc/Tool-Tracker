"use client";

import { useState } from "react";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { PowerOff } from "lucide-react";
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

interface DisableProps {
  itemId: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement;
}

export function DisableItemButton({ itemId, onSuccess, trigger }: DisableProps) {
  const [isDisabling, setIsDisabling] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDisable = async () => {
    setIsDisabling(true);
    try {
      const response = await fetch("/api/item/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, isActive: false }),
      });
      if (!response.ok) {
        throw new Error("Failed to disable item.");
      }
      setOpen(false);
      onSuccess?.();
      toast.success("Item disabled successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            <PowerOff size={16} />
            Disable Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Deactivate Item?</DialogTitle>
          <DialogDescription>
            This will hide the item from the main list. You can restore it later from the Archive menu.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isDisabling}
            onClick={handleDisable}
          >
            {isDisabling ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Disabling...
              </>
            ) : (
              "Confirm Deactivation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
