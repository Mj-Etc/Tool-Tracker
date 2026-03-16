import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, subcategories } = await request.json();

    if (!name || !subcategories || !Array.isArray(subcategories)) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        subcategories: {
          create: subcategories.map((sub: { name: string }) => ({
            name: sub.name,
          })),
        },
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
