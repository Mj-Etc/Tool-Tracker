import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await request.json();
  const deleteItem = await prisma.item.delete({
    where: {
      id: id,
    },
  });
  return NextResponse.json({ msg: "Item deleted" });
}
