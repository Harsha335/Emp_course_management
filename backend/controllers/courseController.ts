import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import cloudinary from '../utils/cloudinary';
import axios from 'axios';
import { JwtPayloadType } from '../utils/jwtHelper';
import { Prisma } from '@prisma/client';
const { Dropbox } = require('dropbox');
require('dotenv').config();

interface CustomRequest extends Request {
  user?: JwtPayloadType;
}

// Function to convert image buffer to base64
const convertToBase64 = (buffer: Buffer, mimeType: string) => {
    try {
        const base64String = Buffer.from(buffer).toString('base64');
        return `data:${mimeType};base64,${base64String}`;
    } catch (error) {
        throw new Error(`file ${buffer} does not exist`);
    }
}

// Function to upload file to Dropbox
const uploadToDropbox = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
  const dbx = new Dropbox({ accessToken: process.env.DROP_BOX_ACCESS_TOKEN});
  const uniqueFileName = `${fileName}_${Date.now()}`;
  try {
      // Upload the file
      const response = await dbx.filesUpload({
          path: `/${uniqueFileName}`, 
          contents: fileBuffer,
      });
      
      // Create a shareable link for the file
      const sharedLink = await dbx.sharingCreateSharedLink({
          path: response.result.path_display,
      });

      // Dropbox shareable links end with `&dl=0`, which prompts the download.
      // Replace `&dl=0` with (`&dl=1` or `&raw=1`) to allow direct access to the file in the browser.
      const publicUrl = sharedLink.result.url.replace('&dl=0', '&raw=1');
      
      return publicUrl;
  } catch (error: any) {
      throw new Error(`Error uploading PDF to Dropbox: ${error?.message}`);
  }
};

export const addCourse = async (req: CustomRequest, res: Response) => {
    try {
        const { course_name, duration, difficulty_level, description, tags } = req.body;
        
        // Type assertion for req.files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Check if the image file was uploaded
        if (!files['course_img'] || files['course_img'].length === 0 || !files['course_file'] || files['course_file'].length === 0) {
            return res.status(400).json({ error: 'Course image & PDF is required.' });
        }

        const img = files['course_img'][0]; // Get the uploaded image file
        const base64Image = convertToBase64(img.buffer, img.mimetype); // Convert image buffer to base64
        const cloudinary_img = await cloudinary.uploader.upload(base64Image, {
            folder: "course_images",
        });

        console.log("Image URL: ", cloudinary_img.url);

        // Process the course PDF file
        const courseFile = files['course_file'][0]; // Get the uploaded course file
        const pdfPublicUrl = await uploadToDropbox(courseFile.buffer, courseFile.originalname); // Upload PDF to Dropbox and get public URL

        console.log("PDF Public URL: ", pdfPublicUrl);
        

        // Create the course in the database
        const newCourse = await prisma.course.create({
            data: {
                course_name,
                description,
                duration,
                difficulty_level,
                course_img_url: cloudinary_img.url,
                course_file_url: pdfPublicUrl, // Save the course file URL
            },
        });

        res.status(201).json({ message: 'Course added successfully', course: newCourse });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Error adding course' });
    }
};


export const allCourses = async (req: CustomRequest, res: Response) => {
  try{
    const courses = await prisma.course.findMany();
    res.status(200).json({courses});
  }catch(err){
    console.error('Error at fetching all courses:', err);
    res.status(500).json({ error: 'Error at fetching courses' });
  }
}


export const courseEmployeeRelation = async (req: CustomRequest, res: Response) => {
  try{
    const courseId: number = Number(req.params.courseId);
    const employees = await prisma.employee.findMany();
    const empByCourseId = await prisma.courseEnrollment.findMany({
      where:{
        course_id: courseId
      },
      select:{
        emp_id: true
      }
    });
    const courseEmp = employees.map(emp => ({...emp,assignedCourse: empByCourseId.filter(cEmp => cEmp.emp_id === emp.emp_id).length === 0 ? false: true}));
    res.status(200).json({courseEmp})
  }catch(err){
    console.error('Error at courseEmployeeRelation:', err);
    res.status(500).json({ error: 'Error at fetching course-employee' });
  }
}

export const courseEmployeeRelationUpdate = async (req: CustomRequest, res: Response) => {
  try {
    const courseId: number = Number(req.params.courseId);
    const { selectedEmpIds }: { selectedEmpIds: string[] } = req.body; // Ensure selectedEmpIds is an array of strings
    // console.log(selectedEmpIds)
    // Create an array of CourseEnrollment records to insert
    const enrollments = selectedEmpIds.map(empId => ({
      emp_id: empId,
      course_id: courseId,
    }));

    // Use createMany to insert the records
    const result = await prisma.courseEnrollment.createMany({
      data: enrollments,
      skipDuplicates: true, // Optionally, skip duplicates if emp_id and course_id combination exists
    });

    res.status(201).json({ message: 'Course enrollments created successfully', result });
  } catch (err) {
    console.error('Error at courseEmployeeRelationUpdate:', err);
    res.status(500).json({ error: 'Error at update course-employee' });
  }
};

export const getPDF =  async (req: CustomRequest, res: Response) => {
  try {
    const {course_file_url} = req.body;
    // console.log('pdfUrl: ',course_file_url)
    const response = await axios.get(course_file_url, { responseType: 'arraybuffer' });

    
    // Set headers to correctly display the PDF file in the frontend
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="file.pdf"');
    // Log response details
    // console.log("Fetched PDF length: ", response.data.length);
    // console.log("Fetched PDF headers: ", response.headers);
    
    // Send the PDF data as array buffer
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).send('Error fetching PDF');
  }
};

export const assignedCoursesDetails = async (req: CustomRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(400).json({ message: "Unverified user" });
    }

    // Fetch course enrollments for the user
    const coursesAssigned = await prisma.courseEnrollment.findMany({
      where: {
        emp_id: user_id
      },
      select: {
        enroll_id: true,
        current_page: true,
        total_pages: true,
        test_score: true,
        course_certificate_url: true,
        course_id: true,
        course: true
      }
    });

    // Prepare results with test_accessed key
    const results = await Promise.all(coursesAssigned.map(async course => {
      // Check if the course_id exists in the question bank
      const isInQuestionBank: boolean = (await prisma.questionBank.findUnique({
        where: {
          course_id: course.course_id
        }
      })) !== null;

      let isTestAccessed: boolean = false;
      if (isInQuestionBank) {
        // Check if there is any notification with status not true for this enroll_id
        const records = (await prisma.notifications.findMany({
          where: {
            enroll_id: course.enroll_id,
            OR: [
              { status: null },
              { status: true }
            ]
          },
          orderBy: {
            created_date: 'desc',
          },
          take: 1,
        }));
        isTestAccessed = records.length === 0;
        console.log(course.enroll_id,records,records.length)
      }

      return {
        ...course,
        isInQuestionBank,
        isTestAccessed
      };
    }));

    console.log("Result: ", results);
    res.status(200).json({ coursesAssigned: results });
  } catch (error) {
    console.error('Error @ fetching assignedCourses:', error);
    res.status(500).send('Error @ fetching assignedCourses');
  }
};


export const updateAssignedCourse = async (req: CustomRequest, res: Response) => {
  try{
    const {
      enroll_id,
      start_time,
      time_spent_in_sec,
      current_page,
      total_pages
    } = req.body;
    await prisma.courseEnrollment.update({
      where:{
        enroll_id
      },
      data:{
        current_page,
        total_pages
      }
    });
    await prisma.courseEngageLogs.create({
      data: {
        enroll_id,
        start_time: new Date(start_time),
        time_spent_in_sec
      }
    });
    res.status(200).json({message: "updated successfully"});
  }catch(error){
    console.error('Error @ updateAssignedCourse:', error);
    res.status(500).send('Error @ updating CourseEngageLogs');
  }
}

export const getAllLearningPaths = async (req: CustomRequest, res: Response) => {
  try{
    const learning_paths = await prisma.learningPath.findMany();
    res.status(200).json({learning_paths});
  }catch(err){
    console.log("Error @ getAllLearningPaths: ", err);
    res.status(500).json({messsage: 'Error at featching learning_paths'});
  }
}

export const addLearningPath = async (req: CustomRequest, res: Response) => {
  try{
    const {path_name, description} = req.body;
    const newLearningPath = await prisma.learningPath.create({
      data: {path_name, description}
    });
    res.status(200).json({newLearningPath});
  }catch(err){
    console.log("Error @ getAllLearningPaths: ", err);
    res.status(500).json({messsage: 'Error at featching learning_paths'});
  }
}

export const getCourseLearningPaths = async (req: CustomRequest, res: Response) => {
  try{
    const {course_id} = req.body;
    // console.log(course_id)
    const learning_paths = await prisma.learningPathMap.findMany({
      where:{
        course_id: Number(course_id)
      },
      select:{
        learningPath:true
      }
    });
    res.status(200).json({learning_paths});
  }catch(err) {
    console.log("Error @ getCourseLearningPaths: ", err);
    res.status(500).json({messsage: 'Error at featching learning_path'});
  }
}

export const coursesCountIncrease = async (req: CustomRequest, res: Response) => {
  try{
    const courses = await prisma.course.findMany({
    });
    // console.log(courses, courses.length);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const prevCourses = await prisma.course.findMany({
      where: {
        createdAt: {
          lte: oneMonthAgo, // Compare with a Date object
        },
      },
    });
    // console.log(prevcourses, prevcourses.length);
    const courseCount = courses.length;
    const courseDeltaPer = ((courses.length - prevCourses.length)/courses.length)*100;
    res.status(200).json({courseCount, courseDeltaPer});

  }catch(error) {
    console.log("Error at dashboard empCount: ", error);
    res.status(500).json({error: 'Error fetching employee count'})
  }
}

export const avgTimeSpentIncrease = async (req: CustomRequest, res: Response) => {
  try {
    // Get the current date and the date from one month ago
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Fetch total time spent by all employees (current)
    const currentLogs = await prisma.courseEngageLogs.findMany({
      select: {
        time_spent_in_sec: true
      }
    });

    // Fetch total time spent by all employees (1 month back)
    const prevLogs = await prisma.courseEngageLogs.findMany({
      where: {
        start_time: {
          lte: oneMonthAgo, // Get records starting from one month ago to now
        }
      },
      select: {
        time_spent_in_sec: true
      }
    });

    // Calculate average time spent (current)
    const currentTotalTime = currentLogs.reduce((acc, log) => acc + log.time_spent_in_sec, 0);
    const currentAvgTime = currentLogs.length > 0 ? currentTotalTime / currentLogs.length : 0;

    // Calculate average time spent (1 month back)
    const prevTotalTime = prevLogs.reduce((acc, log) => acc + log.time_spent_in_sec, 0);
    const prevAvgTime = prevLogs.length > 0 ? prevTotalTime / prevLogs.length : 0;

    // console.log(currentAvgTime, currentTotalTime)
    // console.log(prevAvgTime, prevTotalTime)
      const avgTimeSpentDeltaPer = ((currentAvgTime - prevAvgTime)/currentAvgTime)*100;
    // Send response with both averages
    res.status(200).json({
      avgTimeSpent: currentAvgTime,
      avgTimeSpentDeltaPer
    });

  } catch (error) {
    console.error("Error at dashboard avgTimeSpentIncrease: ", error);
    res.status(500).json({ error: 'Error fetching avg time spent increase' });
  }
};


export const courseEnrollmentIncrease = async (req: CustomRequest, res: Response) => {
  try{
    const courseEnrollments = await prisma.courseEnrollment.findMany({
    });
    // console.log(courses, courses.length);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const prevCourseEnrollments = await prisma.courseEnrollment.findMany({
      where: {
        createdAt: {
          lte: oneMonthAgo, // Compare with a Date object
        },
      },
    });
    // console.log(prevcourses, prevcourses.length);
    const courseEnrollmentCount = courseEnrollments.length;
    const courseEnrollmentDeltaPer = ((courseEnrollments.length - prevCourseEnrollments.length)/courseEnrollments.length)*100;
    res.status(200).json({courseEnrollmentCount, courseEnrollmentDeltaPer});

  }catch(error) {
    console.log("Error at dashboard courseEnrollmentIncrease: ", error);
    res.status(500).json({error: 'Error fetching courseEnrollment Increase'})
  }
}

export const avgTimeSpentForPeriods = async (req: CustomRequest, res: Response) => {
  try {
    const currentDate = new Date();
    
    // 1. Get average time spent for the last 30 days
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const avgTimePerDayLast30Days = await prisma.courseEngageLogs.groupBy({
      by: ['start_time'],
      where: {
        start_time: {
          gte: thirtyDaysAgo,
          lte: currentDate,
        },
      },
      _avg: {
        time_spent_in_sec: true,
      },
    });

    // 2. Format and fill missing dates for the last 30 days
    const formattedAvgTimePerDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const avgEntry = avgTimePerDayLast30Days.find(entry => 
        entry.start_time.toISOString().split('T')[0] === dateString
      );

      return {
        date: dateString,
        avgTimeSpent: avgEntry ? Number(avgEntry._avg.time_spent_in_sec) : 0,
      };
    });

    // 3. Get average time spent for the last 6 months

    interface AvgTimeLog {
      month: Date; // This will hold the Date object for month
      avg_time_spent: number; // This will hold the average time spent
    }

    const sixMonthsAgo = new Date(currentDate);
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6 + 1);
    
    const avgTimePerMonthLast6Months = await prisma.$queryRaw<AvgTimeLog[]>`
      SELECT DATE_TRUNC('month', "start_time") AS month, 
             AVG(time_spent_in_sec) AS avg_time_spent
      FROM "CourseEngageLogs"
      WHERE "start_time" >= ${sixMonthsAgo} AND "start_time" <= ${currentDate}
      GROUP BY month
      ORDER BY month;
    `;

    // 4. Format and fill missing months for the last 6 months
    const formattedAvgTimePerMonthLast6Months = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(sixMonthsAgo);
      month.setMonth(month.getMonth() + i);
      month.setDate(1); // Set the date to the first of the month

      const monthString = month.toISOString().split('T')[0]; // Format as YYYY-MM-01
      
      const avgEntry = avgTimePerMonthLast6Months.find(entry =>
        entry.month.toISOString().substring(0, 10) === monthString
      );

      return {
        date: monthString,
        avgTimeSpent: avgEntry ? Number(avgEntry.avg_time_spent) : 0,
      };
    });

    // 5. Get average time spent for the last year
    const oneYearAgo = new Date(currentDate);
    oneYearAgo.setMonth(currentDate.getMonth() - 12 + 1);
    
    const avgTimePerMonthLastYear = await prisma.$queryRaw<AvgTimeLog[]>`
      SELECT DATE_TRUNC('month', "start_time") AS month, 
             AVG(time_spent_in_sec) AS avg_time_spent
      FROM "CourseEngageLogs"
      WHERE "start_time" >= ${oneYearAgo} AND "start_time" <= ${currentDate}
      GROUP BY month
      ORDER BY month;
    `;

    // 6. Format and fill missing months for the last year
    const formattedAvgTimePerMonthLastYear = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(oneYearAgo);
      month.setMonth(month.getMonth() + i);
      month.setDate(1); // Set the date to the first of the month

      const monthString = month.toISOString().split('T')[0]; // Format as YYYY-MM-01
      
      const avgEntry = avgTimePerMonthLast6Months.find(entry =>
        entry.month.toISOString().substring(0, 10) === monthString
      );

      return {
        date: monthString,
        avgTimeSpent: avgEntry ? Number(avgEntry.avg_time_spent) : 0,
      };
    });
    // console.log({
    //   avgTimePerDayLast30Days: formattedAvgTimePerDay,
    //   avgTimePerMonthLast6Months: formattedAvgTimePerMonthLast6Months,
    //   avgTimePerMonthLastYear: formattedAvgTimePerMonthLastYear,
    // })
    // Respond with the formatted data
    res.status(200).json({
      avgTimePerDayLast30Days: formattedAvgTimePerDay,
      avgTimePerMonthLast6Months: formattedAvgTimePerMonthLast6Months,
      avgTimePerMonthLastYear: formattedAvgTimePerMonthLastYear,
    });
    
  } catch (error) {
    console.error("Error fetching average time spent:", error);
    res.status(500).json({ error: 'Error fetching average time spent' });
  }
};

export const topTrendingCoures = async (req: CustomRequest, res: Response) => {
  try{
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    console.log(limit)
    const courses = await prisma.courseEnrollment.groupBy({
      by: ['course_id'], // Group by course_id
      where: {
        course_certificate_url: {
          not: null, // Only consider records with a non-null course_certificate_url
        },
      },
      _count: {
        course_certificate_url: true, // Count of certificates
      },
      orderBy: {
        _count: {
          course_certificate_url: 'desc', // Order by count in descending order
        },
      },
      take: limit, // Get top 5 courses
    });
    // Fetch course details for the top trending courses
    const courseDetails = await Promise.all(
      courses.map(async (course) => {
        const courseInfo = await prisma.course.findUnique({
          where: { course_id: course.course_id },
          select: {
            course_id: true,
            course_img_url: true,
            course_name: true, // Adjust according to your model's structure
            difficulty_level: true
          },
        });

        return {
          id: courseInfo?.course_id,
          img_url: courseInfo?.course_img_url,
          name: courseInfo?.course_name+' ('+courseInfo?.difficulty_level+')',
          certificates_count: course._count.course_certificate_url, // Certification count
        };
      })
    );

    // Return the response
    res.status(200).json(courseDetails);
  }catch(err){
    console.error("Error fetching topTrendingCoures:", err);
    res.status(500).json({ error: 'Error fetching top trending courses' });
  }
}