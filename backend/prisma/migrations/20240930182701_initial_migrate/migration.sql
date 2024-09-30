-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('SOFTWARE_ENGINEER', 'SR_SOFTWARE_ENGINEER', 'SOLUTION_ENABLER', 'SOLUTION_CONSULTANT', 'TECHNOLOGY_SOLUTION_ARCHITECT', 'PRINCIPAL_SOLUTION_ARCHITECT');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "Employee" (
    "emp_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emp_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "designation" "Designation" NOT NULL,
    "performance_rating" DOUBLE PRECISION,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("emp_id")
);

-- CreateTable
CREATE TABLE "Course" (
    "course_id" SERIAL NOT NULL,
    "course_name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "difficulty_level" TEXT NOT NULL,
    "course_img_url" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "enroll_id" SERIAL NOT NULL,
    "emp_id" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,
    "course_completion_rate" INTEGER NOT NULL,
    "course_certificate_approved" BOOLEAN NOT NULL,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("enroll_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_emp_id_key" ON "Employee"("emp_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_emp_id_course_id_key" ON "CourseEnrollment"("emp_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "Employee"("emp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;
