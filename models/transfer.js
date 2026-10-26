const mongoose = require('mongoose');

// TRANSFERS: id, asset_id, handed_over_by_id, received_by_id, transfered_at
const transferSchema = mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  handedOverBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transferredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transfer', transferSchema);
