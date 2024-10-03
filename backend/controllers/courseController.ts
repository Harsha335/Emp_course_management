import { Request, Response } from 'express';
import prisma from '../utils/prisma';
const cloudinary = require('../utils/cloudinary');
const { Dropbox } = require('dropbox');
const fs = require('fs');

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
  
  try {
      // Upload the file
      const response = await dbx.filesUpload({
          path: `/${fileName}`, 
          contents: fileBuffer,
      });
      
      // Create a shareable link for the file
      const sharedLink = await dbx.sharingCreateSharedLink({
          path: response.result.path_display,
      });

      // Dropbox shareable links end with `?dl=0`, which prompts the download.
      // Replace `?dl=0` with `?raw=1` to allow direct access to the file in the browser.
      const publicUrl = sharedLink.result.url.replace('?dl=0', '?raw=1');
      
      return publicUrl;
  } catch (error: any) {
      throw new Error(`Error uploading PDF to Dropbox: ${error?.message}`);
  }
};

export const addCourse = async (req: Request, res: Response) => {
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
        console.log("pdf url: ", pdfPublicUrl);
        

        // Create the course in the database
        const newCourse = await prisma.course.create({
            data: {
                course_name,
                description,
                duration,
                difficulty_level,
                course_img_url: cloudinary_img.url,
                course_file_url: pdfPublicUrl, // Save the course file URL
                tags,
            },
        });

        res.status(201).json({ message: 'Course added successfully', course: newCourse });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Error adding course' });
    }
};


export const allCourses = async (req: Request, res: Response) => {
  try{
    const courses = await prisma.course.findMany();
    res.status(200).json({courses});
  }catch(err){
    console.error('Error at fetching all courses:', err);
    res.status(500).json({ error: 'Error at fetching courses' });
  }
}


export const courseEmployeeRelation = async (req: Request, res: Response) => {
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

export const courseEmployeeRelationUpdate = async (req: Request, res: Response) => {
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