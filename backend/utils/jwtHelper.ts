import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Create a JWT token
export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Verify a JWT token
export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};