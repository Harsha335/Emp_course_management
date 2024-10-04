/*
  Warnings:

  - You are about to drop the column `avg_time_spent_per_page` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `course_certificate_approved` on the `CourseEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `course_completion_rate` on the `CourseEnrollment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "avg_time_spent_per_page",
ADD COLUMN     "avg_time_spent" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CourseEnrollment" DROP COLUMN "course_certificate_approved",
DROP COLUMN "course_completion_rate",
ADD COLUMN     "course_certificate_url" TEXT,
ADD COLUMN     "course_completion_percentage" INTEGER,
ADD COLUMN     "test_score" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "QuestionBank" (
    "test_id" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("test_id")
);

-- CreateTable
CREATE TABLE "Questions" (
    "question_id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "isMultipleChoice" BOOLEAN NOT NULL,
    "answers" INTEGER[],
    "test_id" TEXT NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "AdminNotifications" (
    "notification_id" SERIAL NOT NULL,
    "enroll_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "AdminNotifications_pkey" PRIMARY KEY ("notification_id")
);

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "QuestionBank"("test_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotifications" ADD CONSTRAINT "AdminNotifications_enroll_id_fkey" FOREIGN KEY ("enroll_id") REFERENCES "CourseEnrollment"("enroll_id") ON DELETE CASCADE ON UPDATE CASCADE;
