-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_emp_id_fkey";

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
