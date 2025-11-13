const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  // quantityInBaseUnit: { type: Number, required: true },
  // baseUnit: { type: String, required: true, enum: ['piece', 'cartoon', 'bundle'] },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Unit', unitSchema);    