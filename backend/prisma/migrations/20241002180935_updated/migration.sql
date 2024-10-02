-- AlterTable
ALTER TABLE "CourseEnrollment" ALTER COLUMN "course_completion_rate" DROP NOT NULL,
ALTER COLUMN "course_completion_rate" DROP DEFAULT,
ALTER COLUMN "course_certificate_approved" DROP NOT NULL,
ALTER COLUMN "course_certificate_approved" DROP DEFAULT;
