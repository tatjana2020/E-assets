const express = require('express');
const router = express.Router();

const Asset = require('../models/asset.js');
const AssetImage = require('../models/assetImage.js');
const Transfer = require('../models/transfer.js');
const User = require('../models/user.js');
const OrganizationalUnit = require('../models/organizationalUnit.js');
const isSignedIn = require('../middleware/is-signed-in.js');
const isAdmin = require('../middleware/is-admin.js');

// Admin can edit every asset, User can edit the assets they created or hold.
const canEdit = (user, asset) => {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  if (String(asset.createdBy) === user._id) return true;
  if (String(asset.currentHolder._id) === user._id) return true;
  return false;
};

// Admin can transfer every asset, User only the assets they hold.
const canTransfer = (user, asset) => {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  return String(asset.currentHolder._id) === user._id;
};

// list of assets with search and filters
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.search) {
      // escape special characters so the search text is treated as normal text
      const text = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      //pretraživanje teksta pomoću or i case-insensitive
      filter.$or = [
        { name: { $regex: text, $options: 'i' } },
        { serialNumber: { $regex: text, $options: 'i' } },
        { inventoryNumber: { $regex: text, $options: 'i' } },
      ];
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.unit) {
      // assets are linked to a unit through their holder
      //filtrira imovinu tako da prikaže samo onu koja je zadužena na ljude iz konkretne OJ
      const people = await User.find({ orgUnit: req.query.unit });
      filter.currentHolder = { $in: people.map((person) => person._id) };
    }
    
    const assets = await Asset.find(filter)
      .sort({ name: 1 })
      .populate({ path: 'currentHolder', populate: { path: 'orgUnit' } });
    const units = await OrganizationalUnit.find();
    const categories = await Asset.distinct('category');

    res.render('assets/index.ejs', {
      assets,
      units,
      categories,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/new', isSignedIn, async (req, res) => {
  try {
    const users = await User.find();
    const categories = await Asset.distinct('category');
    res.render('assets/form.ejs', { asset: {}, users, categories });
  } catch (error) {
    console.log(error);
    res.redirect('/assets');
  }
});

// show details, images, holder and transfer history
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate({ path: 'currentHolder', populate: { path: 'orgUnit' } })
      .populate('createdBy');
    const images = await AssetImage.find({ asset: asset._id });
    const transfers = await Transfer.find({ asset: asset._id })
      .sort({ transferredAt: -1 })
      .populate('handedOverBy')
      .populate('receivedBy');
    const users = await User.find();

    res.render('assets/show.ejs', {
      asset,
      images,
      transfers,
      users,
      canEdit: canEdit(req.session.user, asset),
      canTransfer: canTransfer(req.session.user, asset),
    });
  } catch (error) {
    console.log(error);
    res.redirect('/assets');
  }
});

// CREATE
router.post('/', isSignedIn, async (req, res) => {
  try {
    // an empty serial number must not be saved because serial numbers are unique
    if (!req.body.serialNumber) {
      delete req.body.serialNumber;
    }
    if (!req.body.currentHolder) {
      req.body.currentHolder = req.session.user._id;
    }
    req.body.createdBy = req.session.user._id;

    const asset = await Asset.create(req.body);
    res.redirect(`/assets/${asset._id}`);
  } catch (error) {
    console.log(error);
    res.send('Could not save the asset. The inventory or serial number may already exist.');
  }
});

// EDIT - form
router.get('/:id/edit', isSignedIn, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('currentHolder');
    if (!canEdit(req.session.user, asset)) {
      return res.send('You are not allowed to edit this asset.');
    }
    const users = await User.find();
    const categories = await Asset.distinct('category');
    res.render('assets/form.ejs', { asset, users, categories });
  } catch (error) {
    console.log(error);
    res.redirect('/assets');
  }
});

// UPDATE
router.put('/:id', isSignedIn, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('currentHolder');
    if (!canEdit(req.session.user, asset)) {
      return res.send('You are not allowed to edit this asset.');
    }

    // the holder can only be changed with a transfer
    delete req.body.currentHolder;
    delete req.body.createdBy;

    asset.set(req.body);
    if (!req.body.serialNumber) {
      asset.serialNumber = undefined;
    }
    await asset.save();

    res.redirect(`/assets/${asset._id}`);
  } catch (error) {
    console.log(error);
    res.send('Could not update the asset. The inventory or serial number may already exist.');
  }
});

// DELETE - Admin only
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await AssetImage.deleteMany({ asset: req.params.id });
    await Transfer.deleteMany({ asset: req.params.id });
    await Asset.findByIdAndDelete(req.params.id);
    res.redirect('/assets');
  } catch (error) {
    console.log(error);
    res.redirect('/assets');
  }
});

// ADD IMAGE
router.post('/:id/images', isSignedIn, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('currentHolder');
    if (!canEdit(req.session.user, asset)) {
      return res.send('You are not allowed to edit this asset.');
    }
    await AssetImage.create({ asset: asset._id, imageUrl: req.body.imageUrl });
    res.redirect(`/assets/${asset._id}`);
  } catch (error) {
    console.log(error);
    res.redirect('/assets');
  }
});

// REMOVE IMAGE
router.delete('/:id/images/:imageId', isSignedIn, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('currentHolder');
    if (!canEdit(req.session.user, asset)) {
      return res.send('You are not allowed to edit this asset.');
    }
    await AssetImage.findByIdAndDelete(req.params.imageId);
    res.redirect(`/assets/${asset._id}`);
  } catch (error) {
    console.log(error);
    res.redirect('/assets');
  }
});

module.exports = router;
