const mongoose = require('mongoose');

const DieSchema = new mongoose.Schema({
  dieNo: { type: String, required: true, unique: true },
  //machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  name: { type: String },
  //add compatible product of this die
  productName:{type: String},
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

  description: { type: String },
  // goodProductQuantity: { type: Number, default: 0 },
  // damagedProductQuantity: { type: Number, default: 0 },
  metadata: { type: Object }
}, { timestamps: true });
//pre save hook to set product name from product id
DieSchema.pre('save', async function (next) {
  try {
    if (this.product) {
      const Product = mongoose.model('Product');
      const product = await Product.findById(this.product);
      if (product) {
        this.productName = product.productName;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Die', DieSchema);
