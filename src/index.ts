import express from 'express';
import path from 'path';
const app = express();
const port = 3001; // default port to listen

// Configure Express to use EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// define a route handler for the default home page
app.get('/', (req, res) => {
  // render the index template
  res.render('index');
});

// api routes
// tasks crud
app.get('/tasks', (req, res) => {
  res.send('tasks');
});

// start the express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
