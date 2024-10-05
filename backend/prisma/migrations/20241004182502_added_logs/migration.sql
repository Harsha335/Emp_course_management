/*
  Warnings:

  - You are about to drop the column `avg_time_spent` on the `CourseEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `course_completion_percentage` on the `CourseEnrollment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CourseEnrollment" DROP COLUMN "avg_time_spent",
DROP COLUMN "course_completion_percentage",
ADD COLUMN     "current_page" INTEGER,
ADD COLUMN     "total_pages" INTEGER;

-- CreateTable
CREATE TABLE "CourseEngageLogs" (
    "enroll_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "time_spent_in_sec" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseEngageLogs_enroll_id_start_time_key" ON "CourseEngageLogs"("enroll_id", "start_time");

-- AddForeignKey
ALTER TABLE "CourseEngageLogs" ADD CONSTRAINT "CourseEngageLogs_enroll_id_fkey" FOREIGN KEY ("enroll_id") REFERENCES "CourseEnrollment"("enroll_id") ON DELETE CASCADE ON UPDATE CASCADE;
