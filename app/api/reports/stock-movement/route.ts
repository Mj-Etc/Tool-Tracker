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

    let where = {};
    if (!isOverall) {
      if (startDateParam && endDateParam) {
        const start = new Date(startDateParam);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        where = {
          createdAt: {
            gte: start,
            lte: end,
          },
        };
      } else if (dateParam) {
        const startDate = new Date(dateParam);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateParam);
        endDate.setHours(23, 59, 59, 999);
        where = {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        };
      }
    }

    const logs = await prisma.stockLog.findMany({
      where,
      include: {
        item: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
