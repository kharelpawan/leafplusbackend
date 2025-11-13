const mongoose = require('mongoose');

const GunSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide gun name'],
  },
  code: {
    type: String,
    required: [true, 'Please provide unique gun code'],
    unique: true,
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active',
  },
  remarks: {
    type: String,
    default: '',
  },
  operatingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Gun', GunSchema);
