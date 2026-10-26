const mongoose = require('mongoose');

// ORGANIZATIONAL_UNITS: id, name, type, parent_unit_id
const organizationalUnitSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, trim: true, default: 'Department' },
  parentUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationalUnit',
    default: null,
  },
});

module.exports = mongoose.model('OrganizationalUnit', organizationalUnitSchema);
