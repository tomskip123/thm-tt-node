import * as bcrypt from 'bcryptjs';
import { Client } from '../db';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { v4 } from 'uuid';

// Define User interface
interface UserI {
  _id: ObjectId;
  email: string;
  password: string;
  token: string;
}

// Function for user login
export async function Login(req: Request, res: Response) {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Validate email and password. Send error response if not provided
    if (!(email && password)) {
      return res.status(400).send('All input is required');
    }

    // Get user collection from database
    const User = Client.db('thm-tt').collection<UserI>('users');

    // Validate if user exist in our database
    const user = await User.findOne({ email });

    // If user exists and password is valid
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create JWT token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_KEY,
        {
          expiresIn: '2h',
        }
      );

      // Save user token in database
      await User.updateOne({ _id: user._id }, { $set: { token } });
      user.token = token;

      // Send user data as response
      return res.status(200).json(user);
    }

    // If credentials are not valid, send error response
    return res.status(400).send('Invalid Credentials');
  } catch (err) {
    // Log error if any
    console.error(err);
  }
}

// Function for user registration
export async function Register(req: Request, res: Response) {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Validate email and password. Send error response if not provided
    if (!(email && password)) {
      return res.status(400).send('All input is required');
    }

    // Get user collection from database
    const User = Client.db('thm-tt').collection<UserI>('users');

    // Check if user already exist in our database
    const oldUser = await User.findOne({ email });

    // If user already exists, send error response
    if (oldUser) {
      return res.status(409).send('User Already Exist. Please Login');
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Generate new ObjectId for user
    const id = new ObjectId();

    // Create user
    const user = await User.insertOne({
      _id: id,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      token: '',
    });

    // Create JWT token
    const token = jwt.sign({ user_id: id, email }, process.env.JWT_KEY, {
      expiresIn: '2h',
    });

    // Save user token in database
    await User.updateOne({ _id: id }, { $set: { token } });

    // Send user data as response
    return res.status(201).json(user);
  } catch (err) {
    // Log error if any
    console.error(err);
  }
}
