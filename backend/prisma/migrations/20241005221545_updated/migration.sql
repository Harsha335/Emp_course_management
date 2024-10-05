/*
  Warnings:

  - The primary key for the `Questions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[question_id,test_id]` on the table `Questions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Questions" DROP CONSTRAINT "Questions_pkey",
ALTER COLUMN "question_id" DROP DEFAULT;
DROP SEQUENCE "Questions_question_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Questions_question_id_test_id_key" ON "Questions"("question_id", "test_id");
