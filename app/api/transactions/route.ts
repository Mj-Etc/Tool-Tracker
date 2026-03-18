import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { TransactionSchema } from "@/schemas/transaction";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        // Log the change
        await tx.stockLog.create({
          data: {
            itemId: item.itemId,
            userId: session.user.id,
            change: -item.quantity,
            reason: "SALE",
            oldStock: product.quantity + item.quantity,
            newStock: product.quantity,
          },
        });
      }

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get("date");
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");
        const isOverall = searchParams.get("overall") === "true";

        let where = {};
        if (!isOverall) {
            if (startDateParam && endDateParam) {
                const start = new Date(startDateParam);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDateParam);
                end.setHours(23, 59, 59, 999);
                where = {
                    createdAt: {
                        gte: start,
                        lte: end
                    }
                };
            } else if (dateParam) {
                const startDate = new Date(dateParam);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(dateParam);
                endDate.setHours(23, 59, 59, 999);
                where = {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                };
            }
        }

        const transactions = await prisma.transaction.findMany({
            where,
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
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
