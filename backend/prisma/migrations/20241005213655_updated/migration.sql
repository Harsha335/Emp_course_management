/*
  Warnings:

  - A unique constraint covering the columns `[course_id]` on the table `QuestionBank` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CourseEngageLogs" DROP CONSTRAINT "CourseEngageLogs_enroll_id_fkey";

-- DropForeignKey
ALTER TABLE "QuestionBank" DROP CONSTRAINT "QuestionBank_course_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBank_course_id_key" ON "QuestionBank"("course_id");

-- AddForeignKey
ALTER TABLE "CourseEngageLogs" ADD CONSTRAINT "CourseEngageLogs_enroll_id_fkey" FOREIGN KEY ("enroll_id") REFERENCES "CourseEnrollment"("enroll_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;
