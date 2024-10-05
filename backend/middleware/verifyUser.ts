import { Request, Response, NextFunction } from 'express';
import { JwtPayloadType, verifyToken } from '../utils/jwtHelper';

interface CustomRequest extends Request {
  user?: JwtPayloadType;
}

export const verifyUser = (req: CustomRequest, res: Response, next: NextFunction) => {
  console.log("verifyUser....");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header is missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token) as JwtPayloadType;
    req.user = decoded; // Attach decoded token (user info) to req object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const verifyAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
  console.log("verifyAdmin....");
  verifyUser(req, res, () => {
    // Check if the user is present and has the role of 'ADMIN'
    if (req.user && req.user.role === 'ADMIN') {
      next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  });
};
