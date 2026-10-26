const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');

// const authController = require('./controllers/auth.js');
// const assetsController = require('./controllers/assets.js');
// const unitsController = require('./controllers/units.js');
// const usersController = require('./controllers/users.js');
// const transfersController = require('./controllers/transfers.js');

//const { loadUser } = require('./middleware/auth.js');
const Asset = require('./models/asset.js');
const Transfer = require('./models/transfer.js');

const port = process.env.PORT ? process.env.PORT : '3000';

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
// app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
//app.use(loadUser);

// Home: landing page for visitors, dashboard for signed-in users
app.get('/', async (req, res) => {

  try {
    
  } catch (error) {
    console.log(error);
  }
});

app.use((req, res) => {
  res.status(404).render('error.ejs', { title: 'Not found', message: 'Page not found.' });
});

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
