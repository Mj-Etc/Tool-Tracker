import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eventHub } from "@/lib/hub";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Item IDs are required" }, { status: 400 });
    }
    
    // Ensure all items are actually disabled before deleting
    const items = await prisma.item.findMany({
      where: {
        id: { in: ids },
        isActive: false
      }
    });

    if (items.length !== ids.length) {
      return NextResponse.json({ error: "One or more items are not disabled and cannot be permanently deleted." }, { status: 400 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const id of ids) {
          await tx.item.delete({
            where: { id }
          });
        }
      });
    } catch (error: any) {
      // If we reach here, and the items existed, it's almost certainly a relation constraint
      return NextResponse.json({ 
        error: "Cannot permanently delete items with existing records (sales or logs). Please keep them in the archive instead." 
      }, { status: 400 });
    }

    eventHub.broadcast("mutate", { key: "/api/item/list-items*" });
    eventHub.broadcast("mutate", { key: "/api/stats*" });
    eventHub.broadcast("mutate", { key: "/api/reports/stock-movement*" });

    return NextResponse.json({ msg: `Successfully deleted ${ids.length} items permanently` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
