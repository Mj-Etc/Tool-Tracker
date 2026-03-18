import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, name, description, costPrice, price, quantity, lowStockThreshold, categoryId, subcategoryId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const item = await prisma.$transaction(async (tx) => {
      const currentItem = await tx.item.findUnique({
        where: { id },
        select: { quantity: true }
      });

      if (!currentItem) {
        throw new Error("Item not found");
      }

      const oldStock = currentItem.quantity;
      const newStock = Number(quantity);
      const change = newStock - oldStock;

      const updatedItem = await tx.item.update({
        where: {
          id,
          isActive: true, // Ensure we don't update a disabled item
        },
        data: {
          name,
          description,
          costPrice: Number(costPrice),
          price: Number(price),
          quantity: newStock,
          lowStockThreshold: Number(lowStockThreshold),
          category: { connect: { id: categoryId } },
          subcategory: { connect: { id: subcategoryId } },
        },
      });

      if (change !== 0) {
        await tx.stockLog.create({
          data: {
            itemId: id,
            userId: session.user.id,
            change: change,
            reason: change > 0 ? "RESTOCK" : "MANUAL_ADJUSTMENT",
            oldStock: oldStock,
            newStock: newStock,
          },
        });
      }

      return updatedItem;
    });

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
