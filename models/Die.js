const mongoose = require('mongoose');

const DieSchema = new mongoose.Schema({
  dieNo: { type: String, required: true, unique: true },
  name: { type: String },
  productName: { type: String },
  description: { type: String },
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Die', DieSchema);
