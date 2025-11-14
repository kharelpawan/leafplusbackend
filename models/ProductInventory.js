// const mongoose = require('mongoose');

// const productInventorySchema = new mongoose.Schema({
// //store each product inventory in array with each production batch
//   product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//   //there can be multiple products 
//   totalProduced: { type: Number, default: 0 },//pc
//   totalPackaged: { type: Number, default: 0 },//cartoon
//   availableQuantity: { type: Number, default: 0 },
//  // unit: { type: String, default: 'cartoon' },
//   lastUpdated: { type: Date, default: Date.now }  
  
// }, { timestamps: true });

// module.exports = mongoose.model('ProductInventory', productInventorySchema);

//create a product inventory for multiple products
const mongoose = require('mongoose');

const productInventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  totalProduced: { type: Number, default: 0 }, // in pieces
  totalPackaged: { type: Number, default: 0 }, // in cartoons
  availableQuantity: { type: Number, default: 0 }, // in pieces
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProductInventory', productInventorySchema);    