-- CreateTable
CREATE TABLE "Prerequisites" (
    "course_id" INTEGER NOT NULL,
    "prerequisite_courses" INTEGER[],

    CONSTRAINT "Prerequisites_pkey" PRIMARY KEY ("course_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prerequisites_course_id_key" ON "Prerequisites"("course_id");

-- AddForeignKey
ALTER TABLE "Prerequisites" ADD CONSTRAINT "Prerequisites_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;
