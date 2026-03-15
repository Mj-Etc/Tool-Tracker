import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { TransactionSchema } from "@/schemas/transaction";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = TransactionSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Transaction
      const transaction = await tx.transaction.create({
        data: {
          cashierId: session.user.id,
          customerName: validatedData.customerName,
          totalAmount: validatedData.totalAmount,
        },
      });

      // 2. Create TransactionItems and update stock
      for (const item of validatedData.items) {
        // Create TransactionItem
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          },
        });

        // Decrement stock
        const product = await tx.item.update({
          where: { id: item.itemId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        if (product.quantity < 0) {
          throw new Error(`Insufficient stock for item: ${product.name}`);
        }
      }

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error.name === "ZodError") {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                cashier: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(transactions);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
