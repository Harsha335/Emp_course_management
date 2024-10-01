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
