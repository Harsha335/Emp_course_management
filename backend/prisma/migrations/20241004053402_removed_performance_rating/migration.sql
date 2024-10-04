/*
  Warnings:

  - You are about to drop the column `avg_time_spent` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `performance_rating` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "avg_time_spent";

-- AlterTable
ALTER TABLE "CourseEnrollment" ADD COLUMN     "avg_time_spent" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "performance_rating";
