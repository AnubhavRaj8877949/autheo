/*
  Warnings:

  - You are about to drop the column `SecurityContact` on the `Validator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Validator" DROP COLUMN "SecurityContact",
ADD COLUMN     "securityContact" TEXT NOT NULL DEFAULT '';
