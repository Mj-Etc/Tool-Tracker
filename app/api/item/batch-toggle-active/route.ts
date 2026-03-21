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

    const body = await request.json();
    const { ids, isActive } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Item IDs are required" }, { status: 400 });
    }
    
    await prisma.item.updateMany({
      where: {
        id: { in: ids }
      },
      data: { isActive }
    });

    eventHub.broadcast("mutate", { key: "/api/item/list-items*" });
    eventHub.broadcast("mutate", { key: "/api/stats*" });
    eventHub.broadcast("mutate", { key: "/api/reports/stock-movement*" });

    return NextResponse.json({ msg: `Successfully ${isActive ? 'enabled' : 'disabled'} ${ids.length} items` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
