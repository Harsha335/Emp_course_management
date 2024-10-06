/*
  Warnings:

  - You are about to drop the `AdminNotifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminNotifications" DROP CONSTRAINT "AdminNotifications_enroll_id_fkey";

-- DropTable
DROP TABLE "AdminNotifications";

-- CreateTable
CREATE TABLE "Notifications" (
    "notification_id" SERIAL NOT NULL,
    "enroll_id" INTEGER NOT NULL,
    "status" BOOLEAN,
    "user_viewed" BOOLEAN NOT NULL DEFAULT false,
    "created_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("notification_id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_enroll_id_fkey" FOREIGN KEY ("enroll_id") REFERENCES "CourseEnrollment"("enroll_id") ON DELETE CASCADE ON UPDATE CASCADE;
