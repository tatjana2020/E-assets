const mongoose = require('mongoose');

// USERS: id, name, email, role, org_unit_id  (+ password for session auth)
const userSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  // 'Guest' is not stored: it is any visitor who is not signed in (read-only)
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  orgUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationalUnit',
    default: null,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
