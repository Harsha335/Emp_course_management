/*
  Warnings:

  - Added the required column `course_category` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `difficulty_level` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BASIC', 'BEGINNER', 'INTERMEDIATE', 'EXPERT');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "course_category" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
DROP COLUMN "difficulty_level",
ADD COLUMN     "difficulty_level" "DifficultyLevel" NOT NULL;
