import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import cloudinary from '../utils/cloudinary';
import axios from 'axios';
import { JwtPayloadType } from '../utils/jwtHelper';
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