const mongoose = require('mongoose');

// ASSET_IMAGES: id, asset_id, image_url, uploaded_at
const assetImageSchema = mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  imageUrl: { type: String, required: true, trim: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AssetImage', assetImageSchema);
