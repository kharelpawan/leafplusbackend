const mongoose = require('mongoose');

const DieSchema = new mongoose.Schema({
  dieNo: { type: String, required: true, unique: true },
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  name: { type: String },
  compatibleProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  //productName: { type: String },
  description: { type: String },
  // goodProductQuantity: { type: Number, default: 0 },
  // damagedProductQuantity: { type: Number, default: 0 },
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Die', DieSchema);
