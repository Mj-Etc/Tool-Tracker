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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Core Inventory Stats
    const totalItems = await prisma.item.count();
    const outOfStock = await prisma.item.count({ where: { quantity: 0 } });
    
    const allItems = await prisma.item.findMany({
      select: { id: true, quantity: true, lowStockThreshold: true, costPrice: true, price: true, createdAt: true, name: true }
    });
    
    const lowStock = allItems.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold).length;

    // 2. Financials & KPIs
    const totalInventoryValue = allItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalInventoryCost = allItems.reduce((sum, item) => sum + (Number(item.costPrice) * item.quantity), 0);

    // 3. Sales Analysis (Last 30 Days)
    const recentTransactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { items: true }
    });

    const totalRevenue = recentTransactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const avgTransactionValue = recentTransactions.length > 0 ? totalRevenue / recentTransactions.length : 0;

    // 4. Fast-Moving Items
    const fastMoving = await prisma.transactionItem.groupBy({
      by: ["itemId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
      where: { transaction: { createdAt: { gte: thirtyDaysAgo } } },
    });

    const fastMovingDetails = await Promise.all(
      fastMoving.map(async (stat) => {
        const item = allItems.find(i => i.id === stat.itemId);
        return { id: stat.itemId, name: item?.name || "Unknown", totalSold: stat._sum.quantity };
      })
    );

    // 5. Stock Aging (Items older than 90 days with high stock)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const agingStock = allItems.filter(item => item.createdAt < ninetyDaysAgo && item.quantity > 0).length;

    return NextResponse.json({
      totalItems,
      outOfStock,
      lowStock,
      totalInventoryValue,
      totalInventoryCost,
      avgTransactionValue,
      fastMoving: fastMovingDetails,
      agingStock,
      recentTransactionCount: recentTransactions.length,
      totalRevenue30Days: totalRevenue
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
