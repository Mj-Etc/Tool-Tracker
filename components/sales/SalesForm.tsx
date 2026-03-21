"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { ScrollArea } from "../ui/scroll-area";
import { TransactionItemInput } from "@/schemas/transaction";
import { IconTrash, IconEraser } from "@tabler/icons-react";
import { SalesItemsTable } from "./sales-items-table";
import { ItemWithUser } from "../items/types";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

interface SalesFormProps {
  items: ItemWithUser[];
}

export function SalesForm({ items }: SalesFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "GCASH" | "CARD">("CASH");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<(TransactionItemInput & { name: string })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const clearCart = () => {
    setCart([]);
    setQuantities({});
    setCustomerName("");
    setAmountPaid("");
    setPaymentMethod("CASH");
    toast.success("Cart cleared");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const paid = parseFloat(amountPaid);
    if (paymentMethod === "CASH" && (isNaN(paid) || paid < totalAmount)) {
      toast.error("Amount paid is insufficient");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          items: cart.map(({ name, ...rest }) => rest),
          totalAmount,
          paymentMethod,
          amountPaid: paid || totalAmount
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Transaction completed!");
      setCart([]);
      setCustomerName("");
      setAmountPaid("");
    } catch (error: any) {
      toast.error(error.message || "Failed to process transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const change = (parseFloat(amountPaid) || 0) - totalAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl p-4">
      {/* Product Search & List */}
      <Card className="lg:col-span-7 h-fit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Fast Sale Process</CardTitle>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Identify item and specify quantity</p>
          </div>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="sm" onClick={() => toast.info("Hold feature coming soon!")} className="h-8 text-[10px] uppercase font-bold">
              <IconDeviceFloppy className="mr-1 h-3 w-3" />
              Hold
            </Button> */}
            <Button variant="destructive" size="sm" onClick={clearCart}>
              <IconEraser className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <SalesItemsTable 
              data={items || []} 
              quantities={quantities} 
              onQuantityChange={handleQuantityChange} 
              onAddToCart={addToCart} 
            />
        </CardContent>
      </Card>

      {/* Cart & Checkout */}
      <Card className="lg:col-span-5 h-fit">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Cart
            {cart.length > 0 && <span className="text-sm font-normal text-muted-foreground">{cart.length} items</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Customer / Contractor (Optional)</Label>
            <Input 
              placeholder="Enter customer name..." 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-background text-sm"
            />
          </div>

          <ScrollArea className="h-66 border rounded-md p-2 bg-muted/10">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-sm italic text-muted-foreground/50 font-medium">Cart is empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cart.map(item => (
                  <div key={item.itemId} className="flex flex-col p-2 bg-background rounded-md border shadow-sm group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                      <button onClick={() => removeFromCart(item.itemId)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <IconTrash size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                         <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground">₱{item.unitPrice.toFixed(2)}</p>
                        <p className="font-black text-sm text-primary">₱{item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Payment Method</Label>
              <ToggleGroup 
                type="single" 
                value={paymentMethod} 
                onValueChange={(val) => val && setPaymentMethod(val as any)}
                className="justify-start"
              >
                <ToggleGroupItem value="CASH" className="text-[10px] uppercase font-bold px-3">Cash</ToggleGroupItem>
                {/* <ToggleGroupItem value="GCASH" className="text-[10px] uppercase font-bold px-3">GCash</ToggleGroupItem>
                <ToggleGroupItem value="CARD" className="text-[10px] uppercase font-bold px-3">Card</ToggleGroupItem> */}
              </ToggleGroup>
            </div>

            {paymentMethod === "CASH" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Amount Paid</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₱</span>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="pl-6 font-bold text-lg"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Change</Label>
                  <div className={`h-8 rounded-md border flex items-center px-3 font-black text-lg ${change >= 0 ? "text-emerald-700 bg-emerald-100" : "text-destructive bg-destructive/5"}`}>
                    ₱{Math.max(0, change).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-4">
          <div className="flex justify-between w-full items-center">
            <span className="text-xs uppercase font-bold text-muted-foreground">Total Payable</span>
            <span className="text-lg font-black text-primary">₱{totalAmount.toFixed(2)}</span>
          </div>
          <Button 
            className="w-full text-xl h-10 font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
            disabled={cart.length === 0 || isSubmitting || (paymentMethod === "CASH" && (parseFloat(amountPaid) < totalAmount || !amountPaid))}
            onClick={handleCheckout}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Processing...
              </>
            ) : (
              "COMPLETE TRANSACTION"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
