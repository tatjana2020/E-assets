const mongoose = require('mongoose');

const assetImageSchema = mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const AssetImage = mongoose.model('AssetImage', assetImageSchema);

module.exports = AssetImage;
