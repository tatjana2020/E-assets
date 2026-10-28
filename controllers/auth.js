const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user.js');
const OrganizationalUnit = require('../models/organizationalUnit.js');

router.get('/sign-up', async (req, res) => {
  try {
    const units = await OrganizationalUnit.find();
    res.render('auth/sign-up.ejs', { units });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});

router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.post('/sign-up', async (req, res) => {
  try {
    // Check if the email is already taken
    const userInDatabase = await User.findOne({ email: req.body.email });
    if (userInDatabase) {
      return res.send('Email already taken.');
    }

    // Check if the password and confirm password match
    if (req.body.password !== req.body.confirmPassword) {
      return res.send('Password and Confirm Password must match');
    }

    // the first user who signs up is the Admin, everybody else is a User
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      req.body.role = 'Admin';
    } else {
      req.body.role = 'User';
    }

    // if no unit selected don't send an empty string to the database
    if (!req.body.orgUnit) {
      delete req.body.orgUnit;
    }

    // hash the password before sending to the database
    const hashedPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
    req.body.password = hashedPassword;

    await User.create(req.body);

    res.redirect('/auth/sign-in');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.post('/sign-in', async (req, res) => {
  try {
    // get the user from the database
    const userInDatabase = await User.findOne({ email: req.body.email });
    if (!userInDatabase) {
      return res.send('Login failed. Please try again.');
    }

    // test user password with bcrypt
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
      return res.send('Login failed. Please try again.');
    }

    //when is correct password
    req.session.user = {
      name: userInDatabase.name,
      email: userInDatabase.email,
      role: userInDatabase.role,
      _id: String(userInDatabase._id),
    };

    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

module.exports = router;
