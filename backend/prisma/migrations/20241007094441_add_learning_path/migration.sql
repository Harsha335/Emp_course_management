/*
  Warnings:

  - You are about to drop the column `tags` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "LearningPath" (
    "learning_path_id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "path_name" TEXT NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("learning_path_id")
);

-- CreateTable
CREATE TABLE "LearningPathMap" (
    "course_id" INTEGER NOT NULL,
    "learning_path_id" INTEGER NOT NULL,

    CONSTRAINT "LearningPathMap_pkey" PRIMARY KEY ("course_id","learning_path_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_path_name_key" ON "LearningPath"("path_name");

-- AddForeignKey
ALTER TABLE "LearningPathMap" ADD CONSTRAINT "LearningPathMap_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathMap" ADD CONSTRAINT "LearningPathMap_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "LearningPath"("learning_path_id") ON DELETE CASCADE ON UPDATE CASCADE;
