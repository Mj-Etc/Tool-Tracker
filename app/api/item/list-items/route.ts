import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    const disabledOnly = searchParams.get("disabled") === "true";
    const endDateParam = searchParams.get("endDate");

    let where: any = {};
    if (activeOnly) {
      where.isActive = true;
    } else if (disabledOnly) {
      where.isActive = false;
    } else {
      // Default behavior: show active items
      where.isActive = true;
    }

    if (endDateParam) {
      const endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = {
        lte: endDate
      };
    }

    let items = await prisma.item.findMany({
      where,
      include: {
        user: true,
        category: true,
        subcategory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (endDateParam) {
      const endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);

      const logsAfterEndDate = await prisma.stockLog.groupBy({
        by: ['itemId'],
        where: {
          createdAt: {
            gt: endDate
          }
        },
        _sum: {
          change: true
        }
      });

      const logMap = new Map(logsAfterEndDate.map(log => [log.itemId, log._sum.change || 0]));
      
      items = items.map(item => {
        const changeAfter = logMap.get(item.id) || 0;
        return {
          ...item,
          quantity: Math.max(0, item.quantity - changeAfter)
        } as any;
      });
    }

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
