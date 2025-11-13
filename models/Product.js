const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String },
  //make unit to store in array like one or multiple units can be stored
  piece_to_bundle: { type: Number, default: 0 },
  bundle_to_cartoon: { type: Number, default: 0 }, 
  
  //category: { type: String }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  //totalStock: { type: Number },
  //totalSold: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
