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

    let where: any = {};
    if (activeOnly) {
      where.isActive = true;
    } else if (disabledOnly) {
      where.isActive = false;
    } else {
      // Default behavior: show active items
      where.isActive = true;
    }

    const items = await prisma.item.findMany({
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
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
