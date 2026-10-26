const mongoose = require('mongoose');

const assetSchema = mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  serialNumber: { type: String, unique: true, sparse: true },
  inventoryNumber: { type: String, required: true, unique: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['Active', 'Service', 'Out of service'],
    default: 'Active',
  },
  purchaseDate: { type: Date },
  purchaseValue: { type: Number },
  estimatedLifeYears: { type: Number },
  currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
