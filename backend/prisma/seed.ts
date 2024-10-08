import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    enum Role {
        ADMIN,
        EMPLOYEE
      }
      // Enum for employee designation
enum Designation {
    SOFTWARE_ENGINEER,
    SR_SOFTWARE_ENGINEER,
    SOLUTION_ENABLER,
    SOLUTION_CONSULTANT,
    TECHNOLOGY_SOLUTION_ARCHITECT,
    PRINCIPAL_SOLUTION_ARCHITECT
  }
  // Create multiple users
  const userRoles = ['EMPLOYEE', 'ADMIN']; // Predefined roles
  for (let i = 100; i <= 199; i++) {
    const hashedPassword = await bcrypt.hash(`JMD${i}`, 10);
    await prisma.user.create({
      data: {
        user_id: `JMD${i}`,
        password: hashedPassword, //faker.internet.password(),    // password JMD${i}
        role: userRoles[i % 2], // Assign alternating roles (EMPLOYEE, ADMIN)
        createdAt: faker.date.past(),
      },
    });
    await prisma.employee.create({
      data: {
        emp_id: `JMD${i}`, // Links to user with the same id
        email: `JMD${i}@jmangroup.com`,
        emp_name: faker.person.fullName(),
        designation: i % 2 === 0 ? 'SOFTWARE_ENGINEER' : 'SR_SOFTWARE_ENGINEER', // Alternate designations
      },
    });
  }

  // Create multiple courses
  for (let i = 1; i <= 5; i++) {
    await prisma.course.create({
      data: {
        course_name: `Course ${i}`,
        description: `Description for Course ${i}`,
        duration: `${i} months`, // Dynamic duration
        difficulty_level: i % 4 === 0 ? 'EXPERT' : 'BEGINNER', // Alternate between beginner and expert
        course_img_url: faker.image.url(),
        course_file_url: faker.internet.url(),
        createdAt: faker.date.past(),
      },
    });
  }

  // Create multiple course enrollments
  for (let i = 1; i <= 8; i++) {
    await prisma.courseEnrollment.create({
      data: {
        emp_id: `JMD${i}`, // Link to employee
        course_id: (i % 5) + 1, // Enroll to different courses
        current_page: Math.floor(Math.random() * 50) + 1, // Random page between 1 and 50
        total_pages: 100,
        test_score: Math.floor(Math.random() * 100) + 1, // Random score between 1 and 100
        createdAt: faker.date.recent(),
        course_certificate_url: faker.internet.url(),   // some be null
      },
    });
  }

  // Create multiple learning paths
  for (let i = 1; i <= 3; i++) {
    await prisma.learningPath.create({
      data: {
        path_name: `Learning Path ${i}`,
        description: `Description for Learning Path ${i}`,
      },
    });
  }
// Meaningful learning paths
const learningPaths = [
    { path_name: "Software Engineering", description: "Master the fundamentals of software development" },
    { path_name: "Cloud Computing", description: "Learn about scalable cloud solutions" },
    { path_name: "Data Science", description: "Analyze data and build machine learning models" },
    { path_name: "Cybersecurity", description: "Protect systems and data from security threats" },
    { path_name: "Web Development", description: "Build websites and web applications" },
    { path_name: "Mobile Development", description: "Create mobile applications for Android and iOS" },
    { path_name: "DevOps", description: "Learn about automating deployment and managing infrastructure" },
    { path_name: "AI and Machine Learning", description: "Develop intelligent systems using AI/ML" },
    { path_name: "Blockchain", description: "Understand decentralized systems and blockchain technologies" },
    { path_name: "Internet of Things (IoT)", description: "Connect and control devices with IoT solutions" },
    { path_name: "Project Management", description: "Learn techniques to manage projects efficiently" },
    { path_name: "Agile Methodologies", description: "Master Agile frameworks and tools" },
    { path_name: "Quality Assurance", description: "Ensure software quality through testing" },
    { path_name: "Big Data", description: "Handle and analyze large datasets" },
    { path_name: "Software Architecture", description: "Design scalable and maintainable software systems" },
  ];
  

// Insert learning paths into the database
for (const learningPath of learningPaths) {
    await prisma.learningPath.create({
      data: learningPath,
    });
  }
  
  // Meaningful courses
  const courses = [
    { name: "JavaScript Basics", description: "Learn the fundamentals of JavaScript.", duration: "3 months", difficulty_level: "BEGINNER" },
    { name: "Advanced JavaScript", description: "Master advanced JavaScript concepts.", duration: "2 months", difficulty_level: "EXPERT" },
    { name: "Cloud Infrastructure with AWS", description: "Learn how to build and manage cloud infrastructure using AWS.", duration: "4 months", difficulty_level: "INTERMEDIATE" },
    { name: "Machine Learning with Python", description: "Develop and deploy machine learning models with Python.", duration: "6 months", difficulty_level: "EXPERT" },
    { name: "React for Web Development", description: "Build fast and responsive web applications using React.", duration: "3 months", difficulty_level: "INTERMEDIATE" },
    { name: "Microservices Architecture", description: "Understand and build microservices-based architectures.", duration: "5 months", difficulty_level: "EXPERT" },
    { name: "Docker & Kubernetes", description: "Containerize applications and deploy them using Kubernetes.", duration: "4 months", difficulty_level: "INTERMEDIATE" },
    { name: "SQL for Data Analysis", description: "Analyze and query databases using SQL.", duration: "2 months", difficulty_level: "BEGINNER" },
    { name: "Node.js Backend Development", description: "Develop scalable backend systems using Node.js.", duration: "4 months", difficulty_level: "INTERMEDIATE" },
    { name: "Blockchain Development with Ethereum", description: "Build decentralized applications on the Ethereum blockchain.", duration: "5 months", difficulty_level: "EXPERT" },
    // Add more courses here to reach over 100
  ];
  
  // Insert courses into the database
  for (const course of courses) {
    await prisma.course.create({
      data: {
        course_name: course.name,
        description: course.description,
        duration: course.duration,
        difficulty_level: course.difficulty_level,
        course_img_url: faker.image.url(), // Use faker to generate random image URLs
        course_file_url: faker.internet.url(), // Use faker to generate random file URLs
        createdAt: faker.date.past(), // Random past creation dates
      },
    });
  }
  
  // Assign courses to learning paths
  const courseIds = await prisma.course.findMany({ select: { course_id: true } });
  const learningPathIds = await prisma.learningPath.findMany({ select: { learning_path_id: true } });
  
  // Randomly assign each course to 1-3 learning paths
  for (const course of courseIds) {
    const assignedPaths = faker.helpers.shuffle(learningPathIds).slice(0, faker.datatype.number({ min: 1, max: 3 }));
    for (const path of assignedPaths) {
      await prisma.learningPathMap.create({
        data: {
          course_id: course.course_id,
          learning_path_id: path.learning_path_id,
        },
      });
    }
  }
  
  
  // Create LearningPathMap (assign multiple courses to learning paths)
  for (let i = 1; i <= 5; i++) {
    await prisma.learningPathMap.create({
      data: {
        course_id: i, // Link each course
        learning_path_id: (i % 3) + 1, // Assign each course to a learning path
      },
    });
  }

  // Create multiple CourseEngageLogs
  for (let i = 1; i <= 8; i++) {
    await prisma.courseEngageLogs.create({
      data: {
        enroll_id: i, // Link to enrollments
        start_time: faker.date.recent(),
        time_spent_in_sec: Math.floor(Math.random() * 3600) + 600, // Random time spent between 10 minutes and 1 hour
      },
    });
  }

//   model QuestionBank {
//     test_id   String      @id @default(uuid()) // Changed to String with uuid generation
//     course_id Int
//     time_per_question_in_sec Int
  
//     // Relationships
//     course Course @relation(fields: [course_id], references: [course_id]) // Made optional
//     Questions Questions[] 
//     @@unique([course_id])
//   }
  
//   model Questions {
//     question_id      Int 
//     question         String // The question text
//     options          String[] // Array of options (can be multiple)
//     isMultipleChoice Boolean // Is it a multiple-choice question?
//     answers          Int[] // Array of indices representing the correct answer(s)
//     test_id          String // Foreign key to the QuestionBank
  
//     // Foreign key relation to QuestionBank
//     QuestionBank QuestionBank @relation(fields: [test_id], references: [test_id], onDelete: Cascade)
  
//     @@unique([question_id, test_id])
//   }
  
//   model Notifications {
//     notification_id Int     @id @default(autoincrement()) // Primary Key
//     enroll_id       Int // Foreign key to CourseEnrollment
//     status          Boolean?  // accepted(true), rejected(false)
//     user_viewed     Boolean @default(false)
//     created_date    DateTime
  
//     // Foreign key relation to CourseEnrollment
//     CourseEnrollment CourseEnrollment @relation(fields: [enroll_id], references: [enroll_id], onDelete: Cascade)
//   }

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
