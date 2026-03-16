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

    await prisma.item.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({ msg: `Successfully deleted ${ids.length} items permanently` });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
