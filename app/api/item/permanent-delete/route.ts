import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }
    
    // Only allow permanent delete if isActive is false
    const item = await prisma.item.findUnique({
      where: { id }
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.isActive) {
      return NextResponse.json({ error: "Cannot permanently delete an active item. Disable it first." }, { status: 400 });
    }

    await prisma.item.delete({
      where: { id }
    });

    return NextResponse.json({ msg: "Item permanently deleted successfully" });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
