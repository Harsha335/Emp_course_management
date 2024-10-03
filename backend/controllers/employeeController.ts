import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get all employees
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany();
    console.log(employees)
    res.status(200).json({employees});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employees' });
  }
};