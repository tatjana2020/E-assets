const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  orgUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationalUnit' },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
