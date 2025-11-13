const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: mongoose.Schema.Types.String, required: true, ref: 'User.name' },
  isActive: { type: Boolean, default: true },
  //totalCollections: { type: Number, default: 0 },
  totalLeavesCollected: { type: Number, default: 0 },
  //totalEarnings: { type: Number, default: 0 },
  //pendingPayments: { type: Number, default: 0 },
  pendingAmounts: { type: Number, default: 0 },
}, { timestamps: true });

// hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('CollectorUser', UserSchema);
