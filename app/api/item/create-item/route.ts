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

    const { name, description, costPrice, price, quantity, lowStockThreshold, categoryId, subcategoryId } = await request.json();
    const item = await prisma.item.create({
      data: {
        name,
        description,
        costPrice: Number(costPrice),
        price: Number(price),
        quantity: Number(quantity),
        lowStockThreshold: Number(lowStockThreshold),
        categoryId,
        subcategoryId,
        user: { connect: { id: session.user.id } },
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
