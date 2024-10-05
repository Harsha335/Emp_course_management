/*
  Warnings:

  - A unique constraint covering the columns `[course_name,difficulty_level]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `time_per_question_in_sec` to the `QuestionBank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionBank" ADD COLUMN     "time_per_question_in_sec" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_name_difficulty_level_key" ON "Course"("course_name", "difficulty_level");
