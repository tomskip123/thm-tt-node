import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { addTask, deleteTask, getTasks, updateTask } from './methods/Task';
import { Login, Register } from './methods/Auth';
import Auth from './middleware/auth';

// Create Express app
const app = express();

// Load port from an environment variable or use default
const port = process.env.PORT || 3001;

// Use Helmet middleware for securing Express apps with various HTTP headers
app.use(helmet());

// Use bodyParser middleware for parsing JSON bodies
app.use(bodyParser.json());

// Define authentication routes
app.post('/login', Login);
app.post('/register', Register);
app.get('/validate', Auth, (req, res) => res.json(true)); // validate JWT token

// Define task CRUD routes
app.get('/tasks', Auth, getTasks); // get tasks
app.post('/tasks', Auth, addTask); // add task
app.delete('/tasks/:id', Auth, deleteTask); // delete task
app.put('/tasks/:id', Auth, updateTask); // update task

// Start the Express server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
