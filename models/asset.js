const mongoose = require('mongoose');

// ASSETS
const assetSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    // Unique records: no two assets can share an inventory/serial number
    serialNumber: { type: String, trim: true, unique: true, sparse: true },
    inventoryNumber: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true }, // description / specification
    status: {
      type: String,
      enum: ['Active', 'Service', 'Out of service'],
      default: 'Active',
    },
    purchaseDate: { type: Date },
    purchaseValue: { type: Number, min: 0 },
    estimatedLifeYears: { type: Number, min: 0 },
    currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// depreciation-racuna currentValue - amortizovanje na osnovu nabavne vrednosti, datuma i procenjenog veka trajanja
assetSchema.virtual('currentValue').get(function () {
  if (!this.purchaseValue || !this.estimatedLifeYears || !this.purchaseDate) {
    return null;
  }
  const years = (Date.now() - this.purchaseDate.getTime()) / (365.25 * 24 * 3600 * 1000);
  const value = this.purchaseValue * (1 - years / this.estimatedLifeYears);
  return Math.max(0, value);
});

module.exports = mongoose.model('Asset', assetSchema);
