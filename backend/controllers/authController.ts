import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwtHelper';

// Sign in a user
export const signInUser = async (req: Request, res: Response) => {
  const { user_id, user_password } = req.body;
  console.log(user_id, user_password)
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { user_id},
    });
    console.log(user)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare provided password with the stored hashed password
    const isMatch = await bcrypt.compare(user_password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.user_id);

    res.status(200).json({ token });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error signing in' });
  }
};

// Create a new admin
export const signUpAdmin = async (req: Request, res: Response) => {
  try{
    const { user_id, password } = req.body;
    console.log( user_id, password )
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        user_id,
        password: hashedPassword,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.log("Error at signUpAdmin: ", error)
    res.status(500).json({ error: 'Error creating admin' });
  }
}

// Create a new emp.
export const signUpEmployee = async (req: Request, res: Response) => {
  try {
    const { emp_id, emp_name, email, designation, password } = req.body;
    console.log( emp_id, emp_name, email, designation, password )
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        user_id: emp_id,
        password: hashedPassword,
      },
    });

    const newEmp = await prisma.employee.create({
      data: {
        emp_id,
        email,
        emp_name,
        designation
      }
    });

    res.status(201).json(newEmp);
  } catch (error) {
    console.log("Error at signUp: ", error)
    res.status(500).json({ error: 'Error creating emp' });
  }
};