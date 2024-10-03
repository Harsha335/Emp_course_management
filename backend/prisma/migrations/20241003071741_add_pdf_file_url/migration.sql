/*
  Warnings:

  - Made the column `course_file_url` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "course_file_url" SET NOT NULL;
