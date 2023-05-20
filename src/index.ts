import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import { addTask, deleteTask, getTasks, updateTask } from './methods/Task';
import { Login, Register } from './methods/Auth';
import Auth from './middleware/auth';

const app = express();
const port = 3001; // default port to listen

// Use Helmet to secure against typical attacks!
app.use(helmet());

// parse application/json
app.use(bodyParser.json());

// define a route handler for the default home page
app.get('/', Auth, (req, res) => {
  // render the index template
  res.render('index');
});

// api routes
// tasks crud
app.get('/tasks', async (req, res) => res.json(await getTasks()));
app.post('/tasks', async (req, res) => res.json(await addTask(req.body)));
// delete task
app.delete('/tasks/:id', async (req, res) =>
  res.json(await deleteTask(req.params.id))
);

// authentication endpoints
app.post('/login', async (req, res) => await Login(req, res));
app.post('/register', async (req, res) => await Register(req, res));

// update task
app.put('/tasks/:id', async (req, res) =>
  res.json(await updateTask(req.params.id, req.body))
);

// start the express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
