import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Total products count
    const totalItems = await prisma.item.count();

    // 2. Out of stock count (quantity = 0)
    const outOfStock = await prisma.item.count({
      where: { quantity: 0 }
    });

    // 3. Low stock count (quantity <= lowStockThreshold and > 0)
    // Prisma doesn't support comparing two columns directly in count without raw query or complex where, 
    // but we can fetch them and filter if the dataset is small, or use a more specific query.
    // For now, let's just get the items and filter.
    const allItems = await prisma.item.findMany({
        select: {
            quantity: true,
            lowStockThreshold: true
        }
    });
    const lowStock = allItems.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold).length;

    // 4. Top 5 fast-moving items
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const fastMoving = await prisma.transactionItem.groupBy({
      by: ["itemId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
      where: {
        transaction: {
          createdAt: { gte: thirtyDaysAgo },
        },
      },
    });

    const fastMovingDetails = await Promise.all(
      fastMoving.map(async (stat) => {
        const item = await prisma.item.findUnique({
          where: { id: stat.itemId },
          select: { name: true }
        });
        return {
          id: stat.itemId,
          name: item?.name || "Unknown",
          totalSold: stat._sum.quantity
        };
      })
    );

    return NextResponse.json({
      totalItems,
      outOfStock,
      lowStock,
      fastMoving: fastMovingDetails
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
