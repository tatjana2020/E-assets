const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');

const authController = require('./controllers/auth.js');
const assetsController = require('./controllers/assets.js');
const transfersController = require('./controllers/transfers.js');
const unitsController = require('./controllers/units.js');
const usersController = require('./controllers/users.js');

const passUserToView = require('./middleware/pass-user-to-view.js');
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
app.use(passUserToView);

// Home page
app.get('/', async (req, res) => {
  try {
    let total = 0;
    let active = 0;
    let service = 0;
    let outOfService = 0;
    let myAssets = [];
    let recentTransfers = [];

    if (req.session.user) {
      total = await Asset.countDocuments();
      active = await Asset.countDocuments({ status: 'Active' });
      service = await Asset.countDocuments({ status: 'Service' });
      outOfService = await Asset.countDocuments({ status: 'Out of service' });
      myAssets = await Asset.find({ currentHolder: req.session.user._id });
      recentTransfers = await Transfer.find()
        .sort({ transferredAt: -1 })
        .limit(5)
        .populate('asset')
        .populate('handedOverBy')
        .populate('receivedBy');
    }

    res.render('index.ejs', {
      total,
      active,
      service,
      outOfService,
      myAssets,
      recentTransfers,
    });
  } catch (error) {
    console.log(error);
    res.send('Something went wrong.');
  }
});

app.use('/auth', authController);
app.use('/assets', assetsController);
app.use('/transfers', transfersController);
app.use('/units', unitsController);
app.use('/users', usersController);

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
