import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eventHub } from "@/lib/hub";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description, costPrice, price, quantity, lowStockThreshold, categoryId, subcategoryId } = await request.json();
    
    const item = await prisma.$transaction(async (tx) => {
      const newItem = await tx.item.create({
        data: {
          name,
          description,
          costPrice: Number(costPrice),
          price: Number(price),
          quantity: Number(quantity),
          lowStockThreshold: Number(lowStockThreshold),
          category: { connect: { id: categoryId } },
          subcategory: { connect: { id: subcategoryId } },
          user: { connect: { id: session.user.id } },
        },
      });

      if (Number(quantity) !== 0) {
        await tx.stockLog.create({
          data: {
            itemId: newItem.id,
            userId: session.user.id,
            change: Number(quantity),
            reason: "CREATION",
            oldStock: 0,
            newStock: Number(quantity),
          },
        });
      }

      return newItem;
    });

    eventHub.broadcast("mutate", { key: "/api/item/list-items*" });
    eventHub.broadcast("mutate", { key: "/api/stats*" });
    eventHub.broadcast("mutate", { key: "/api/reports/stock-movement*" });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
