import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session && session!.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }
    
    const result = await prisma.item.deleteMany({
      where: {
        id: id,
        userId: session?.user.id, 
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ msg: "Item deleted successfully" });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}