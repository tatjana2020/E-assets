const express = require('express');
const router = express.Router();

const Asset = require('../models/asset.js');
const Transfer = require('../models/transfer.js');
const User = require('../models/user.js');
const isSignedIn = require('../middleware/is-signed-in.js');

router.use(isSignedIn);

// history of all transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .sort({ transferredAt: -1 })
      .populate('asset')
      .populate('handedOverBy')
      .populate('receivedBy');
    res.render('transfers/index.ejs', { transfers });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// CREATE the current holder or an Admin hands the asset over to another user
router.post('/', async (req, res) => {
  try {
    const me = req.session.user;
    const asset = await Asset.findById(req.body.asset);
    const receiver = await User.findById(req.body.receivedBy);

    if (!receiver) {
      return res.send('Please choose who receives the asset.');
    }
    if (me.role !== 'Admin' && String(asset.currentHolder) !== me._id) {
      return res.send('Only the current holder or an Admin can transfer this asset.');
    }
    if (String(asset.currentHolder) === String(receiver._id)) {
      return res.send('That user already holds this asset.');
    }

    await Transfer.create({
      asset: asset._id,
      handedOverBy: asset.currentHolder,
      receivedBy: receiver._id,
    });

    asset.currentHolder = receiver._id;
    await asset.save();

    res.redirect(`/assets/${asset._id}`);
  } catch (error) {
    console.log(error);
    res.redirect('/assets');
  }
});

module.exports = router;
