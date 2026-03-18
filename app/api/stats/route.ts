import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const isOverall = searchParams.get("overall") === "true";

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let dateFilter = {};

    if (!isOverall) {
      if (startDateParam && endDateParam) {
        startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateParam) {
        startDate = new Date(dateParam);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(dateParam);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        endDate = new Date();
      }
      dateFilter = { gte: startDate, lte: endDate };
    }

    // 1. Core Inventory Stats
    const allItems = await prisma.item.findMany({
      select: { 
        id: true, 
        quantity: true, 
        lowStockThreshold: true, 
        costPrice: true, 
        price: true, 
        createdAt: true, 
        name: true,
        isActive: true
      }
    });

    // If endDate is provided (not overall), calculate historical quantities
    const effectiveEndDate = isOverall ? null : endDate;
    
    let historicalItems = allItems;
    if (effectiveEndDate) {
      const logsAfterEndDate = await prisma.stockLog.groupBy({
        by: ['itemId'],
        where: {
          createdAt: {
            gt: effectiveEndDate
          }
        },
        _sum: {
          change: true
        }
      });

      const logMap = new Map(logsAfterEndDate.map(log => [log.itemId, log._sum.change || 0]));
      
      historicalItems = allItems
        .filter(item => item.createdAt <= effectiveEndDate)
        .map(item => {
          const changeAfter = logMap.get(item.id) || 0;
          return {
            ...item,
            quantity: Math.max(0, item.quantity - changeAfter)
          };
        });
    }

    const totalItems = historicalItems.length;
    const outOfStock = historicalItems.filter(i => i.quantity <= 0).length;
    const lowStock = historicalItems.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold).length;

    // 2. Financials & KPIs
    const totalInventoryValue = historicalItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalInventoryCost = historicalItems.reduce((sum, item) => sum + (Number(item.costPrice) * item.quantity), 0);

    // 3. Sales Analysis
    const recentTransactions = await prisma.transaction.findMany({
      where: isOverall ? {} : { createdAt: dateFilter },
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
      where: isOverall ? {} : { transaction: { createdAt: dateFilter } },
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
      totalRevenue: totalRevenue // renamed for clarity
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
