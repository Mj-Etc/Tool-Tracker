import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    const updatedItems = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const itemData of items) {
        const { id, quantity } = itemData;
        const restockAmount = Number(quantity);

        if (isNaN(restockAmount) || restockAmount <= 0) {
          continue; // Or handle error
        }

        const currentItem = await tx.item.findUnique({
          where: { id },
          select: { id: true, quantity: true, name: true }
        });

        if (!currentItem) {
          throw new Error(`Item with ID ${id} not found`);
        }

        const oldStock = currentItem.quantity;
        const newStock = oldStock + restockAmount;

        const updatedItem = await tx.item.update({
          where: { id },
          data: {
            quantity: newStock,
          },
        });

        await tx.stockLog.create({
          data: {
            itemId: id,
            userId: session.user.id,
            change: restockAmount,
            reason: "RESTOCK",
            oldStock: oldStock,
            newStock: newStock,
          },
        });

        results.push(updatedItem);
      }

      return results;
    });

    return NextResponse.json({ message: "Items restocked successfully", items: updatedItems }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
