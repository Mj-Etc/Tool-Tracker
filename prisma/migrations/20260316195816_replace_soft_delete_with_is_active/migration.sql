/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "item" DROP COLUMN "deletedAt",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
