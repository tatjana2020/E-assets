const express = require('express');
const router = express.Router();

const OrganizationalUnit = require('../models/organizationalUnit.js');
const User = require('../models/user.js');
const isSignedIn = require('../middleware/is-signed-in.js');
const isAdmin = require('../middleware/is-admin.js');

router.use(isSignedIn);

// everyone who is signed in can see the units
router.get('/', async (req, res) => {
  try {
    const units = await OrganizationalUnit.find().sort({ name: 1 }).populate('parentUnit');
    res.render('units/index.ejs', { units });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// for Admins only

router.get('/new', isAdmin, async (req, res) => {
  try {
    const units = await OrganizationalUnit.find();
    res.render('units/form.ejs', { unit: {}, units });
  } catch (error) {
    console.log(error);
    res.redirect('/units');
  }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    if (!req.body.parentUnit) {
      delete req.body.parentUnit;
    }
    await OrganizationalUnit.create(req.body);
    res.redirect('/units');
  } catch (error) {
    console.log(error);
    res.redirect('/units');
  }
});

router.get('/:id/edit', isAdmin, async (req, res) => {
  try {
    const unit = await OrganizationalUnit.findById(req.params.id);
    // a unit can not be its own parent
    const units = await OrganizationalUnit.find({ _id: { $ne: unit._id } });
    res.render('units/form.ejs', { unit, units });
  } catch (error) {
    console.log(error);
    res.redirect('/units');
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const unit = await OrganizationalUnit.findById(req.params.id);
    unit.name = req.body.name;
    unit.type = req.body.type;
    unit.parentUnit = req.body.parentUnit ? req.body.parentUnit : undefined;
    await unit.save();
    res.redirect('/units');
  } catch (error) {
    console.log(error);
    res.redirect('/units');
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    // do not delete a unit that is still in use
    const subUnits = await OrganizationalUnit.countDocuments({ parentUnit: req.params.id });
    const members = await User.countDocuments({ orgUnit: req.params.id });
    if (subUnits > 0 || members > 0) {
      return res.send('This unit still has sub-units or members, so it can not be deleted.');
    }
    await OrganizationalUnit.findByIdAndDelete(req.params.id);
    res.redirect('/units');
  } catch (error) {
    console.log(error);
    res.redirect('/units');
  }
});

module.exports = router;
