const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, Message: "Please Provide Email" },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      'superadmin',
      'headofficeadmin',
      'headofficeaccountant',
      'accountantmanager',
      'factorymanager',
      'storemanager',
      'salesmanager',
      'salesperson',
      'collector'
    ],
    default: 'collector'
  },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  metadata: { type: Object }
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

module.exports = mongoose.model('User', UserSchema);
