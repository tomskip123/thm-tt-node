import * as bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Client } from '../db';

const DATABASE_NAME = 'thm-tt';
const COLLECTION_NAME = 'users';
const JWT_SECRET_KEY = process.env.JWT_KEY;
const JWT_EXPIRES_IN = '2h';

/**
 * @typedef UserI
 * @property {ObjectId} _id - The unique id of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The hashed password of the user.
 * @property {string} token - The jwt token of the user.
 */
export interface UserI {
  _id: ObjectId;
  email: string;
  password: string;
  token: string;
}

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
 * Handles user login.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export async function Login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).json({ error: 'All input is required' });
      return;
    }

    const user = await users().findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ user_id: user._id, email }, JWT_SECRET_KEY, {
        expiresIn: JWT_EXPIRES_IN,
      });

      await users().updateOne({ _id: user._id }, { $set: { token } });
      user.token = token;

      res.status(200).json(user);
    } else {
      res.status(400).json({ error: 'Invalid Credentials' });
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
}

/**
 * Handles user registration.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export async function Register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).json({ error: 'All input is required' });
      return;
    }

    const oldUser = await users().findOne({ email });

    if (oldUser) {
      res.status(409).json({ error: 'User Already Exist. Please Login' });
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const id = new ObjectId();

    const user = await users().insertOne({
      _id: id,
      email: email.toLowerCase(),
      password: encryptedPassword,
      token: '',
    });

    const token = jwt.sign({ user_id: id, email }, JWT_SECRET_KEY, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await users().updateOne({ _id: id }, { $set: { token } });

    res.status(201).json(user);
  } catch (err) {
    errorHandler(err, req, res);
  }
}
