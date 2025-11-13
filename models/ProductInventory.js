const mongoose = require('mongoose');

const productInventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  totalProduced: { type: Number, default: 0 },//pc
  totalPackaged: { type: Number, default: 0 },//cartoon
  availableQuantity: { type: Number, default: 0 },
 // unit: { type: String, default: 'cartoon' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProductInventory', productInventorySchema);
