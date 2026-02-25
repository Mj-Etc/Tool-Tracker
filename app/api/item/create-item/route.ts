import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    console.log("No session!");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name, description } = await request.json();
  const item = await prisma.item.create({
    data: {
      name,
      description,
      user: { connect: { id: session?.user?.id } },
    },
  });
  return NextResponse.json(item, { status: 201 });
}
