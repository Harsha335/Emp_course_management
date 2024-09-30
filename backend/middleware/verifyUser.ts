import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtHelper';

interface JwtPayload {
  id: number;
  // Add other fields if necessary
}
interface CustomRequest extends Request {
    user?: JwtPayload;
}

export const verifyUser = (req: CustomRequest, res: Response, next: NextFunction) => {
    console.log("verifyUser....")
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header is missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token) as JwtPayload;
    req.user = decoded; // Attach decoded token (user info) to req object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
