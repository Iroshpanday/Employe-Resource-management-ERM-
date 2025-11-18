/*
  Warnings:

  - You are about to drop the column `lockedUntil` on the `LoginAttempt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LoginAttempt" DROP COLUMN "lockedUntil";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lockedUntil" TIMESTAMP(3);
