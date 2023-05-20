import * as bcrypt from 'bcryptjs';
import { Client } from '../db';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { v4 } from 'uuid';

interface UserI {
  _id: ObjectId;
  email: string;
  password: string;
  token: string;
}

export async function Login(req: Request, res: Response) {
  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send('All input is required');
    }

    const User = Client.db('thm-tt').collection<UserI>('users');

    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_KEY,
        {
          expiresIn: '2h',
        }
      );

      // save user token
      await User.updateOne({ _id: user._id }, { $set: { token } });
      user.token = token;

      // user
      return res.status(200).json(user);
    }

    return res.status(400).send('Invalid Credentials');
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
}

export async function Register(req: Request, res: Response) {
  // Our register logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send('All input is required');
    }

    const User = Client.db('thm-tt').collection<UserI>('users');

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send('User Already Exist. Please Login');
    }

    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    const id = new ObjectId();

    // Create user in our database
    const user = await User.insertOne({
      _id: id,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      token: '',
    });

    // // Create token
    const token = jwt.sign({ user_id: id, email }, process.env.TOKEN_KEY, {
      expiresIn: '2h',
    });

    // save user token
    await User.updateOne({ _id: id }, { $set: { token } });

    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
}
