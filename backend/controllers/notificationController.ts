import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { JwtPayloadType } from '../utils/jwtHelper';
import { createCanvas, loadImage, registerFont } from 'canvas';
import cloudinary from '../utils/cloudinary';
// import path from 'path';
import fs from 'fs';
// import fontkit from 'fontkit';
// Register the Algerian font with canvas
const path = require('path');
const fontPath = path.join(__dirname, '../../frontend/public/Algerian-Regular.ttf');
registerFont(fontPath, { family: 'Algerian' });

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

export const getUserNotifications = async (req: CustomRequest, res: Response) => {
    try {
        const user_id = req.user?.user_id || ''; // Default to an empty string if no user_id
        
        // Fetch notifications
        const notifications = await prisma.notifications.findMany({
            where: {
                status: { not: null },
                user_viewed: {equals: false}
            },
            select: {
                notification_id: true,
                created_date: true,
                status: true, 
                CourseEnrollment: {
                    select:{
                        enroll_id: true,
                        emp_id: true,
                        course_certificate_url: true,
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
                        }
                    }
                }
            }
        });

        // Filter enrollments for the specific user
        const filteredNotifications = notifications.filter(notification => (
            notification.CourseEnrollment.emp_id === user_id
        ));



        console.log("data: ", filteredNotifications);
        res.status(200).json(filteredNotifications);
    } catch (err) {
        console.log("Error at getUserNotifications: ", err);
        res.status(500).json({ error: 'Error fetching getUserNotifications' });
    }
};

export const markAsRead = async (req: CustomRequest, res: Response) => {
    try{
        const {notification_ids}:{notification_ids:  number[]} = req.body;
        console.log(notification_ids)
        // Create an array of update promises
        const updatePromises = notification_ids.map(notification_id => {
            return prisma.notifications.update({
                where: { notification_id }, // Assuming notification.id contains the notification ID
                data: {
                    user_viewed: true // Update the field as needed
                }
            });
        });

        // Execute all update promises in parallel
        await Promise.all(updatePromises);
        console.log('All notifications updated successfully.');

        res.status(200).json({message: 'Marked as read!'});
    }catch(err){
        console.log("Error at markAsRead: ", err);
        res.status(500).json({error: 'Error at mark as read'});
    }
}


const generateElegantCertificateImage = async (emp_name: string, course_name: string, test_score: number) => {
    // Use the correct dimensions for your canvas
    const canvas = createCanvas(1090, 692);
    const ctx = canvas.getContext('2d');

    // Load the certificate background template image
    const backgroundImage = await loadImage('https://res.cloudinary.com/deppcolt3/image/upload/v1728276743/Screenshot_2024-10-07_100904_pumndr.png'); // Update as needed
    ctx.drawImage(backgroundImage, 0, 0, 1090, 692); // Match the canvas size

    // Set white color for all text
    ctx.fillStyle = '#FFFFFF';

    // Draw the main title
    ctx.font = "Sans Italic Extra-Condensed Not-Rotated 24px"; // Use the registered Algerian font
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', 600, 150); // Centered with respect to canvas width

    // Add elegant text about the certificate
    ctx.font = "Sans Not-Rotated 24px"; // Clean, elegant font for the description
    ctx.fillText('This certificate is awarded to', 580, 240); // Centered text

    // Add Employee's Name (larger and bold)
    ctx.font = "Sans Bold Extra-Condensed Not-Rotated 44px"; // Classic, professional look
    ctx.fillText(emp_name, 580, 300); // Centered text

    // Add course name and score
    ctx.font = "Sans Bold Extra-Condensed Not-Rotated 22px";
    ctx.fillText(`For successfully completing the course: ${course_name}`, 580, 350); // Centered text
    ctx.fillText(`with an outstanding score of ${test_score}%`, 580, 400); // Centered text

    // Add bottom-right section for the signature and logo
    // Uncomment and adjust position as necessary when adding the logo
    // const logo = await loadImage('https://res.cloudinary.com/deppcolt3/image/upload/v1728241628/JMAN-logo_ufuicp.png');
    // ctx.drawImage(logo, 700, 500, 200, 100); // Ensure the logo fits properly

    ctx.font = "Sans Not-Rotated 22px"; // Verdana for the footer text
    ctx.fillText('Certificate approved by:', 580, 550); // Centered text
    ctx.fillText('JMAN Group', 580, 590); // Centered text

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