import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Define configuration variables
const config = process.env;

// Middleware for authentication
export default function Auth(req: Request, res: Response, next: NextFunction) {
  try {
    // Retrieve the token from request
    const token =
      req.body.token || req.query.token || req.headers['x-access-token'];

    // If no token found, return error response
    if (!token) {
      return res.status(403).send('A token is required for authentication');
    }

    // Verify the token
    const decoded = jwt.verify(token, config.JWT_KEY);

    // If verification succeeds, append decoded user data to request
    (req as any).user = decoded;

    // Move to next middleware
    return next();
  } catch (err) {
    // If verification fails, return error response
    return res.status(401).send('Invalid Token');
  }
}
