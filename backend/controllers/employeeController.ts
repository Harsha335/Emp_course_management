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