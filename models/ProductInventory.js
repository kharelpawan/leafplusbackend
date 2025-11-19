

//create a product inventory for multiple products
const mongoose = require('mongoose');

const ProductInventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  totalProduced: { type: Number, default: 0 }, // in pieces
  totalPackaged: { type: Number, default: 0 }, // in cartoons
  availableQuantity: { type: Number, default: 0 }, // in pieces
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProductInventory', ProductInventorySchema);    