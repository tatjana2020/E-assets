const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const OrganizationalUnit = require('../models/organizationalUnit.js');
const isAdmin = require('../middleware/is-admin.js');

// only admins can manage users
router.use(isAdmin);

router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 }).populate('orgUnit');
    const units = await OrganizationalUnit.find();
    res.render('users/index.ejs', { users, units });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// change the role and unit of a user
router.put('/:id', async (req, res) => {
  try {
    if (req.params.id === req.session.user._id) {
      return res.send('You can not change your own role.');
    }
    const user = await User.findById(req.params.id);
    user.role = req.body.role;
    user.orgUnit = req.body.orgUnit ? req.body.orgUnit : undefined;
    await user.save();
    res.redirect('/users');
  } catch (error) {
    console.log(error);
    res.redirect('/users');
  }
});

module.exports = router;
