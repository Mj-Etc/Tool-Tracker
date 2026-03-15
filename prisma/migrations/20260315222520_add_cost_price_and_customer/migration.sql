-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "customerName" TEXT;
