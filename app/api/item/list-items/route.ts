import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const items = await prisma.item.findMany({
    include: {
        user: true,
    },
    orderBy: {
        createdAt: "desc",
    }
  });
  return NextResponse.json(items, { status: 200 });
}
