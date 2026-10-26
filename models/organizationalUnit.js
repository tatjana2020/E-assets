const mongoose = require('mongoose');

const organizationalUnitSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  parentUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationalUnit' },
});

const OrganizationalUnit = mongoose.model('OrganizationalUnit', organizationalUnitSchema);

module.exports = OrganizationalUnit;
