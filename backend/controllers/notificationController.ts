import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { JwtPayloadType } from '../utils/jwtHelper';
import { createCanvas, loadImage } from 'canvas';
import cloudinary from '../utils/cloudinary';
import path from 'path';
require('dotenv').config();

interface CustomRequest extends Request {
  user?: JwtPayloadType;
}

export const getAdminNotifications = async (req: CustomRequest, res: Response) => {
    try{
        const data = await prisma.notifications.findMany({
            where:{
                status: null
            },
            select: {
                notification_id: true,
                created_date: true,
                CourseEnrollment: {
                    select:{
                        enroll_id: true,
                        emp_id: true,
                        current_page: true,
                        total_pages: true,
                        test_score: true,
                        employee: { // Get employee name
                            select: {
                                emp_name: true,
                            },
                        },
                        course: { // Get course details
                            select: {
                                course_name: true,
                                difficulty_level: true,
                            },
                        },
                        CourseEngageLogs: {
                            select: {
                                time_spent_in_sec: true
                            },
                        },
                    }
                }
            }
        });

        // Manually sum the time_spent_in_sec for each enrollment
        const enrichedData = data.map((notification) => {
            const totalTimeSpent = notification.CourseEnrollment.CourseEngageLogs.reduce((acc, log) => acc + log.time_spent_in_sec, 0);
            return {
                ...notification,
                totalTimeSpent,
            };
        });
        console.log("enrichedData: ",enrichedData);
        res.status(200).json(enrichedData);
    }catch(err){
        console.log("Error at getAdminNotifications: ", err);
        res.status(500).json({ error: 'Error fetching getAdminNotifications' });
    }
}

// Function to generate the certificate image with an elegant design
const generateElegantCertificateImage = async (emp_name: string, course_name: string, test_score: number) => {
    const canvas = createCanvas(1000, 700); // Adjust size based on your template
    const ctx = canvas.getContext('2d');

    // Load a certificate background template image
    // const backgroundImage = await loadImage('path_to_your_template_image'); // Replace with your actual template file
    // ctx.drawImage(backgroundImage, 0, 0, 1000, 700);

    // Customize colors and fonts for the certificate design
    ctx.fillStyle = '#001F54'; // Royal blue shade for main text
    ctx.font = 'bold 36px "Times New Roman"';
    ctx.textAlign = 'center';

    // Draw main title
    ctx.fillText('Certificate of Completion', 500, 150);

    // Add elegant text about the certificate, positioning the name and details centrally
    ctx.font = 'italic 24px "Arial"';
    ctx.fillText(`This certificate is awarded to`, 500, 240);
    
    // Add Employee's Name (larger and bold)
    ctx.font = 'bold 42px "Georgia"';
    ctx.fillStyle = '#8B008B'; // Royal purple shade
    ctx.fillText(`${emp_name}`, 500, 300);

    // Add course name and score
    ctx.font = 'italic 24px "Arial"';
    ctx.fillStyle = '#4B0082'; // Royal pink shade
    ctx.fillText(`For successfully completing the course: ${course_name}`, 500, 350);
    ctx.fillText(`with an outstanding score of ${test_score}%`, 500, 400);

    // Add bottom-right section for the signature and logo
    // https://res.cloudinary.com/deppcolt3/image/upload/v1728241628/JMAN-logo_ufuicp.png
    // https://res.cloudinary.com/deppcolt3/image/upload/v1728241629/B7WaDf7aXrm4dcXjA0vImxyFZW91685699091497_200x200_dba9ut.png
    const logo = await loadImage('https://res.cloudinary.com/deppcolt3/image/upload/v1728241628/JMAN-logo_ufuicp.png');
    ctx.drawImage(logo, 700, 500, 200, 100); // Adjust positioning as necessary

    ctx.font = 'bold 22px "Arial"';
    ctx.fillStyle = '#001F54'; // Royal blue shade for the footer text
    ctx.fillText('Certificate approved by:', 500, 550);
    ctx.fillText('JMAN Group', 500, 590);

    // Convert the canvas to a buffer (image)
    const buffer = canvas.toBuffer('image/png');

    // Upload to Cloudinary
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;
    const cloudinary_img = await cloudinary.uploader.upload(base64Image, {
        folder: 'certificates',
    });

    // Return Cloudinary URL of the uploaded image
    return cloudinary_img.url;
};

// Function to handle the generation and updating of notification
export const updateNotification = async (req: Request, res: Response) => {
    try {
        const { enroll_id } = req.params;
        const { emp_name, course_name, test_score, status } = req.body;
        if (status === true) {
            // Generate the course certificate with elegant design
            const certificateUrl = await generateElegantCertificateImage(emp_name, course_name, test_score);
            console.log("Certificate url: ", certificateUrl);
            // Update the CourseEnrollment with the generated certificate URL
            await prisma.courseEnrollment.update({
                where: { enroll_id: Number(enroll_id) },
                data: { course_certificate_url: certificateUrl },
            });
        }

        // Update Notifications status
        await prisma.notifications.updateMany({
            where: { enroll_id: Number(enroll_id) },
            data: { status },
        });

        res.status(200).json({ message: 'Notification updated successfully.'});
    } catch (err) {
        console.error('Error at updateNotification: ', err);
        res.status(500).json({ error: 'Error updating Notification' });
    }
};