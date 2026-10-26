const mongoose = require('mongoose');

const transferSchema = mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  handedOverBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transferredAt: { type: Date, default: Date.now },
});

const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer;
