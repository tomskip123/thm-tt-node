import { Request, Response, NextFunction } from 'express';
import { Client } from '../db';
import { UserI } from './Auth';

const DATABASE_NAME = 'thm-tt';
const COLLECTION_NAME = 'users';

/**
 * @typedef UserI
 * // Provide more details about UserI based on your actual implementation.
 */

/**
 * Gets the users collection.
 * @returns {Collection} The users collection.
 */
const users = () => Client.db(DATABASE_NAME).collection<UserI>(COLLECTION_NAME);

/**
 * Handles errors by logging them and sending a 500 response.
 * @param {Error} err - The error to handle.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const errorHandler = (err: Error, req: Request, res: Response) => {
  console.error(err); // Consider using a logging library here
  res.status(500).json({ error: 'Internal Server Error' });
};

/**
 * Gets all users.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const result = await users().find({}).toArray();

    res.json(result.length > 0 ? result : { warning: 'No users found!' });
  } catch (err) {
    errorHandler(err, req, res);
  }
}
