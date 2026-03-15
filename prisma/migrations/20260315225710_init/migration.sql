/*
  Warnings:

  - You are about to drop the column `status` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `StockAdjustment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockAdjustment" DROP CONSTRAINT "StockAdjustment_itemId_fkey";

-- DropForeignKey
ALTER TABLE "StockAdjustment" DROP CONSTRAINT "StockAdjustment_userId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "status";

-- DropTable
DROP TABLE "StockAdjustment";
