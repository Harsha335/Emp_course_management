import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { JwtPayloadType } from '../utils/jwtHelper';

interface CustomRequest extends Request {
  user?: JwtPayloadType;
}
// Get all employees
export const getAllEmployees = async (req: CustomRequest, res: Response) => {
  try {
    const employees = await prisma.employee.findMany();
    console.log(employees)
    res.status(200).json({employees});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employees' });
  }
};

export const empCountIncrease = async (req: CustomRequest, res: Response) => {
  try{
    const users = await prisma.user.findMany({
      where:{
        role: 'EMPLOYEE'
      }
    });
    // console.log(users, users.length);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const prevUsers = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
        createdAt: {
          lte: oneMonthAgo, // Compare with a Date object
        },
      },
    });
    // console.log(prevUsers, prevUsers.length);
    const empCount = users.length;
    const empDeltaPer = ((users.length - prevUsers.length)/users.length)*100;
    res.status(200).json({empCount, empDeltaPer});

  }catch(error) {
    console.log("Error at dashboard empCount: ", error);
    res.status(500).json({error: 'Error fetching employee count'})
  }
}

export const getEmployeeStatistics = async (req: CustomRequest, res: Response) => {
  const emp_id = req.user?.user_id ? req.user.user_id : "JMD001";

  try {
    // Fetch employee statistics
    const statistics = await prisma.courseEnrollment.aggregate({
      _count: {
        course_id: true, // Total courses assigned
        course_certificate_url: true, // Total certificates (non-null)
      },
      _avg: {
        test_score: true, // Average test score
      },
      where: {
        emp_id: emp_id, // Filter by employee ID
      },
    });

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    // Fetch employee statistics
    const prevStatistics = await prisma.courseEnrollment.aggregate({
      _count: {
        course_id: true, // Total courses assigned
        course_certificate_url: true, // Total certificates (non-null)
      },
      _avg: {
        test_score: true, // Average test score
      },
      where: {
        emp_id: emp_id, // Filter by employee ID
        createdAt: {
          lte: oneMonthAgo
        }
      },
    });

    // Fetch average time spent
    const timeSpent = await prisma.courseEngageLogs.aggregate({
      _avg: {
        time_spent_in_sec: true, // Average time spent
      },
      where: {
        CourseEnrollment: {
          emp_id: emp_id, // Filter by employee ID
        },
      },
    });
    const prevTimeSpent = await prisma.courseEngageLogs.aggregate({
      _avg: {
        time_spent_in_sec: true, // Average time spent
      },
      where: {
        CourseEnrollment: {
          emp_id: emp_id, // Filter by employee ID
        },
        start_time:{
          lte: oneMonthAgo
        }
      },
    });

    // Combine the results
    const result = {
      totalCoursesAssigned: {curr: statistics._count.course_id, prev: prevStatistics._count.course_id},
      totalCertificates: {curr: statistics._count.course_certificate_url, prev: prevStatistics._count.course_certificate_url},
      avgTestScore: {curr: statistics._avg.test_score || null, prev: prevStatistics._avg.test_score || null}, // Handle case where avg is null
      avgTimeSpent: {curr: timeSpent._avg.time_spent_in_sec || null, prev: prevTimeSpent._avg.time_spent_in_sec || null} // Handle case where avg is null
    };

    // Return the response
    res.json(result);
  } catch (err) {
    console.error("Error fetching employee statistics:", err);
    res.status(500).json({ error: 'Error fetching employee statistics' });
  }
};