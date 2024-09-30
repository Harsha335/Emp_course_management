/*
  Warnings:

  - You are about to drop the column `phone_number` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "phone_number";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
