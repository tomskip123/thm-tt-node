import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import { addTask, getTasks } from './dal/Task';

const app = express();
const port = 3001; // default port to listen

// Use Helmet!
app.use(helmet());

// parse application/json
app.use(bodyParser.json());

// define a route handler for the default home page
app.get('/', (req, res) => {
  // render the index template
  res.render('index');
});

// api routes
// tasks crud
app.get('/tasks', async (req, res) => res.json(await getTasks()));
app.post('/tasks', async (req, res) => res.json(await addTask(req.body)));

// start the express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
