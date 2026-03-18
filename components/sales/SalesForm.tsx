"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { toast } from "sonner";
import { useSocket } from "../socket-provider";
import { Spinner } from "../ui/spinner";
import { ScrollArea } from "../ui/scroll-area";
import { TransactionItemInput } from "@/schemas/transaction";
import { IconTrash } from "@tabler/icons-react";
import { SalesItemsTable } from "./sales-items-table";
import { ItemWithUser } from "../items/types";

export function SalesForm() {
  const { data: items, isLoading: itemsLoading } = useSWR<ItemWithUser[]>("/api/item/list-items", fetcher);
  const [customerName, setCustomerName] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<(TransactionItemInput & { name: string })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendMessage } = useSocket();

  const handleQuantityChange = (itemId: string, val: string) => {
    if (val === "") {
      setQuantities(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setQuantities(prev => ({ ...prev, [itemId]: num }));
    }
  };

  const addToCart = (item: ItemWithUser) => {
    const qtyToAdd = quantities[item.id] || 1;
    
    if (item.quantity <= 0) {
      toast.error("Item is out of stock!");
      return;
    }

    if (qtyToAdd > item.quantity) {
      toast.error(`Only ${item.quantity} units available in stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.itemId === item.id);
      if (existing) {
        const newQty = existing.quantity + qtyToAdd;
        if (newQty > item.quantity) {
          toast.error(`Cannot add more than available stock (${item.quantity} units total)!`);
          return prev;
        }
        return prev.map(i => 
          i.itemId === item.id 
            ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice } 
            : i
        );
      }
      return [...prev, { 
        itemId: item.id, 
        name: item.name, 
        quantity: qtyToAdd, 
        unitPrice: Number(item.price), 
        subtotal: qtyToAdd * Number(item.price) 
      }];
    });

    // Reset local quantity for this item
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
    toast.success(`Added ${qtyToAdd} x ${item.name} to cart`);
  };

  const updateCartQuantity = (itemId: string, newQty: number) => {
    const item = items?.find(i => i.id === itemId);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (newQty > item.quantity) {
      toast.error(`Only ${item.quantity} units available!`);
      return;
    }

    setCart(prev => prev.map(i => 
      i.itemId === itemId 
        ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice } 
        : i
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          items: cart.map(({ name, ...rest }) => rest),
          totalAmount
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Transaction completed!");
      setCart([]);
      setCustomerName("");
      sendMessage({ type: "transaction:created" });
    } catch (error: any) {
      toast.error(error.message || "Failed to process transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl p-4">
      {/* Product Search & List */}
      <Card className="lg:col-span-7 h-fit">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Fast Sale Process</CardTitle>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Identify product node and specify quantity</p>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Spinner className="h-8 w-8 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Accessing Inventory Cluster...</p>
            </div>
          ) : (
            <SalesItemsTable 
              data={items || []} 
              quantities={quantities} 
              onQuantityChange={handleQuantityChange} 
              onAddToCart={addToCart} 
            />
          )}
        </CardContent>
      </Card>

      {/* Cart & Checkout */}
      <Card className="lg:col-span-5 h-fit sticky top-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Cart
            {cart.length > 0 && <span className="text-sm font-normal text-muted-foreground">{cart.length} items</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Customer / Contractor (Optional)</label>
            <Input 
              placeholder="Enter customer name..." 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-background"
            />
          </div>
          <ScrollArea className="h-61.5 pr-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cart.map(item => (
                  <div key={item.itemId} className="flex flex-col p-3 bg-accent/20 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{item.name}</span>
                      <button onClick={() => removeFromCart(item.itemId)} className="text-red-500 hover:text-red-700">
                        <IconTrash size={18} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">₱{item.unitPrice.toFixed(2)} each</p>
                        <p className="font-bold">₱{item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-4">
          <div className="flex justify-between w-full text-2xl font-black">
            <span>Total:</span>
            <span className="text-primary">₱{totalAmount.toFixed(2)}</span>
          </div>
          <Button 
            className="w-full text-xl h-14 font-black shadow-lg shadow-primary/20" 
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Processing...
              </>
            ) : (
              "Complete Sale"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
