import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export type JwtPayloadType = {
  user_id : string;
  role: string;
}
// Create a JWT token
export const generateToken = (user: JwtPayloadType) => {
  return jwt.sign({ user_id: user.user_id, role: user.role }, SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Verify a JWT token
export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};