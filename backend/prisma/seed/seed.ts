import bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

enum Designation {
  SOFTWARE_ENGINEER = 'SOFTWARE_ENGINEER',
  SR_SOFTWARE_ENGINEER = 'SR_SOFTWARE_ENGINEER',
  SOLUTION_ENABLER = 'SOLUTION_ENABLER',
  SOLUTION_CONSULTANT = 'SOLUTION_CONSULTANT',
  TECHNOLOGY_SOLUTION_ARCHITECT = 'TECHNOLOGY_SOLUTION_ARCHITECT',
  PRINCIPAL_SOLUTION_ARCHITECT = 'PRINCIPAL_SOLUTION_ARCHITECT',
}

async function readCSV(filePath: string): Promise<any[]> {
  const results: any[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data: string) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: string) => reject(error));
  });
}

async function main() {
  // Predefined roles and designations for alternating assignments
  const designations: Designation[] = [
    Designation.SOFTWARE_ENGINEER,
    Designation.SR_SOFTWARE_ENGINEER,
    Designation.SOLUTION_ENABLER,
    Designation.SOLUTION_CONSULTANT,
    Designation.TECHNOLOGY_SOLUTION_ARCHITECT,
    Designation.PRINCIPAL_SOLUTION_ARCHITECT,
  ];

  await prisma.courseEngageLogs.deleteMany({
    where:{
      enroll_id: { gte : 100}
    }
  });
  await prisma.notifications.deleteMany({
    where:{
      notification_id: {gte: 100}
    }
  });
  await prisma.courseEnrollment.deleteMany({
    where: {
      enroll_id: { gte: 100 },
    },
  });
  
  // Clear courses and learning paths (from ID 100 to 199 for courses and 100 to 114 for learning paths)
  await prisma.course.deleteMany({
    where: {
      course_id: { gte: 100, lte: 199 },
    },
  });
  await prisma.learningPath.deleteMany({
    where: {
      learning_path_id: { gte: 100, lte: 114 },
    },
  });
  await prisma.learningPathMap.deleteMany({
    where: {
      course_id: { gte: 100, lte: 199 },
    },
  });
  
  await prisma.employee.deleteMany({
    where: {
      emp_id: { gte: 'JMD100', lte: 'JMD199' },
    },
  });
  // Clear existing users and employees from 100 to 199
  await prisma.user.deleteMany({
    where: {
      user_id: { gte: 'JMD100', lte: 'JMD199' },
    },
  });

  // Create 100 users and employees
  for (let i = 100; i <= 199; i++) {
    const hashedPassword = await bcrypt.hash(`JMD${i}`, 10);
    const randomDesignation = designations[i % designations.length];

    await prisma.user.create({
      data: {
        user_id: `JMD${i}`,
        password: hashedPassword,
        role: Role.EMPLOYEE,
        createdAt: faker.date.past(),
      },
    });

    await prisma.employee.create({
      data: {
        emp_id: `JMD${i}`,
        email: `JMD${i}@jmangroup.com`,
        emp_name: faker.person.fullName(),
        designation: randomDesignation,
      },
    });
  }


  // Read and insert data from CSVs
  const courses = await readCSV(path.join(__dirname, '../uploads_fakeData/courses.csv'));
  const learningPaths = await readCSV(path.join(__dirname, '../uploads_fakeData/learning_paths.csv'));
  const learningPathMap = await readCSV(path.join(__dirname, '../uploads_fakeData/learning_path_map.csv'));

  // Insert courses into the database
  for (const course of courses) {
    await prisma.course.create({
      data: {
        course_id: parseInt(course.course_id),
        course_name: course.course_name,
        description: course.description,
        duration: course.duration,
        difficulty_level: course.difficulty_level,
        course_img_url: faker.image.url(),//course.course_img_url || faker.image.url(), // Provide a fallback value using faker
        course_file_url: faker.internet.url(),//course.course_file_url || faker.internet.url(), // Provide a fallback value using faker
      },
    });
  }

  // Insert learning paths into the database
  for (const learningPath of learningPaths) {
    await prisma.learningPath.create({
      data: {
        learning_path_id: parseInt(learningPath.learning_path_id),
        path_name: learningPath.path_name,
        description: learningPath.description,
      },
    });
  }

  // Insert learning path mapping
  for (const map of learningPathMap) {
    await prisma.learningPathMap.create({
      data: {
        course_id: parseInt(map.course_id),
        learning_path_id: parseInt(map.learning_path_id),
      },
    });
  }


  
  let enroll_id: number = 100;
  
  // Assign random unique courses to employees in the CourseEnrollment table
  const courseIds = await prisma.course.findMany({ select: { course_id: true } });
  const courseIdArray = courseIds.map(course => course.course_id); // Get array of course ids
  
  for (let i = 100; i <= 199; i++) {
    const assignedCourses = new Set<number>(); // Track the courses already assigned to the employee
    const numCoursesToAssign = Math.floor(Math.random() * 5) + 1; // Randomly decide to assign 1 to 5 courses
  
    while (assignedCourses.size < numCoursesToAssign) {
      const randomCourseId = courseIdArray[Math.floor(Math.random() * courseIdArray.length)];
  
      if (!assignedCourses.has(randomCourseId)) { // Ensure the course hasn't already been assigned
        assignedCourses.add(randomCourseId); // Add the course to the employee's assignments
  
        await prisma.courseEnrollment.create({
          data: {
            enroll_id,
            emp_id: `JMD${i}`,
            course_id: randomCourseId,
            current_page: Math.floor(Math.random() * 100) + 1,
            total_pages: 100,
            test_score: Math.floor(Math.random() * 100) + 1,
            createdAt: faker.date.past(),
            course_certificate_url: Math.random() < 0.7 ? faker.internet.url() : null,
          },
        });
  
        enroll_id++;
      }
    }
  }
  

  // Create multiple CourseEngageLogs
  const enrollments = await prisma.courseEnrollment.findMany({ select: { enroll_id: true } });

  for (const enrollment of enrollments) {
    for (let i = 1; i <= Math.floor(Math.random() * 5) + 1; i++) {
      await prisma.courseEngageLogs.create({
        data: {
          enroll_id: enrollment.enroll_id,
          start_time: faker.date.past(),
          time_spent_in_sec: Math.floor(Math.random() * 3600) + 600,
        },
      });
    }
  }

  let notification_id: number = 100;
  // Logic for Notifications
  for (const enrollment of enrollments) {
    const hasCertificate = await prisma.courseEnrollment.findUnique({
      where: { enroll_id: enrollment.enroll_id },
      select: { course_certificate_url: true },
    });

    const falseNotificationCount = Math.floor(Math.random() * 5) + 1;
    // Generate multiple 'false' status notifications
    for (let i = 0; i < falseNotificationCount; i++) {
      await prisma.notifications.create({
        data: {
          notification_id,
          enroll_id: enrollment.enroll_id,
          status: false,
          user_viewed: false,
          created_date: faker.date.past(),
        },
      });
      notification_id +=1 ;
    }

    // If the enrollment has a certificate, create one 'true' status notification at the end
    if (hasCertificate?.course_certificate_url) {
      await prisma.notifications.create({
        data: {
          notification_id,
          enroll_id: enrollment.enroll_id,
          status: true,
          user_viewed: false,
          created_date: faker.date.recent(),
        },
      });
      notification_id += 1;
    }
  }

  console.log('Seeding complete with multiple records!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });