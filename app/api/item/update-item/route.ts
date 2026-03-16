import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, name, description, costPrice, price, quantity, lowStockThreshold, categoryId, subcategoryId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const item = await prisma.item.update({
      where: {
        id,
        isActive: true, // Ensure we don't update a disabled item
      },
      data: {
        name,
        description,
        costPrice: Number(costPrice),
        price: Number(price),
        quantity: Number(quantity),
        lowStockThreshold: Number(lowStockThreshold),
        category: { connect: { id: categoryId } },
        subcategory: { connect: { id: subcategoryId } },
      },
    });
    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
