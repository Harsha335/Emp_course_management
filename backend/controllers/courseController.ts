import { Request, Response } from 'express';
import prisma from '../utils/prisma';
const cloudinary = require('../utils/cloudinary');

// SAVE IMAGE INTO CLOUDINARY ARTICLE 👏 - https://medium.com/@joeeasy_/uploading-images-to-cloudinary-using-multer-and-expressjs-f0b9a4e14c54
const convertImageToBase64URL = (buffer: Buffer, imageType = 'png') => {
    try {
      const base64String = Buffer.from(buffer).toString('base64');
      return `data:image/${imageType};base64,${base64String}`;
    } catch (error) {
      throw new Error(`file ${buffer} no exist `)
    }
}

export const addCourse =  async (req: Request, res: Response) => {
  try {
    const { course_name, duration, difficulty_level, description, tags } = req.body;
    // Check if the file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Course image is required.' });
    }

    const img = req.file;
    const base64 = convertImageToBase64URL(img.buffer, img.mimetype.split("/")[1]);   //convert buffer to base64
    // console.log("file-base64 : ",base64);
    const cloudinary_img = await cloudinary.uploader.upload(base64, {
        folder: "course_images",
        // width: 300,
        // crop: "scale"
    });
    console.log("image url : ",cloudinary_img.url);

    // Create the course in the database
    const newCourse = await prisma.course.create({
      data: {
        course_name,
        description,
        duration,
        difficulty_level,
        course_img_url: cloudinary_img.url,
        tags
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