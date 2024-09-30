import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    console.log(users)
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Get a single user by ID
// export const getUserById = async (req: Request, res: Response) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: Number(req.params.id) },
//     });
//     if (user) {
//       res.status(200).json(user);
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching user' });
//   }
// };

// Update a user by ID
// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const { user_name, user_email, user_password } = req.body;
//     const updatedUser = await prisma.user.update({
//       where: { id: Number(req.params.id) },
//       data: {
//         user_name,
//         user_email,
//         user_password, // In production, ensure this is hashed
//       },
//     });
//     res.status(200).json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ error: 'Error updating user' });
//   }
// };

// // Delete a user by ID
// export const deleteUser = async (req: Request, res: Response) => {
//   try {
//     await prisma.user.delete({
//       where: { id: Number(req.params.id) },
//     });
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ error: 'Error deleting user' });
//   }
// };
