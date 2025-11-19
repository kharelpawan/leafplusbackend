//give model for sales batch
const mongoose = require('mongoose');

const salesBatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true },
  date: { type: Date, default: Date.now },
  productsSold: [
    {
      productName: { type: String },
      productId: {type: String},
      //quantity in pieces, cartoon and bundles together
      quantity: { type: Number, required: true },
      unit: { type: String, enum: ['piece', 'bundle', 'cartoon'], required: true }, 
      //if unit is bundle or cartoon, convert to pieces based on product info else keep as is
      pricePerUnit: { type: Number, required: true },
      amount: {type: Number}
    }
  ],
  totalAmount: { type: Number},
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Object }
}, { timestamps: true });

salesBatchSchema.pre('save', async function (next) {
  let totalSum = 0;
  const productInventory = mongoose.model('ProductInventory');
  //console.log("this"+productInventory);
  this.productsSold.map(async(p)=>{
      p.amount = p.quantity * p.pricePerUnit;
      totalSum +=  p.quantity * p.pricePerUnit;
      

      const inventoryRecord = await productInventory.findById({_id: p.productId})
      if (inventoryRecord) {
      p.productName = inventoryRecord.productName;
     inventoryRecord.availableQuantity -= p.quantity;
     await inventoryRecord.save();   
    }
  })
  console.log(totalSum);
  this.totalAmount = totalSum;

    

  if (!this.batchId) {
    const stamp = Date.now().toString(36).toUpperCase().slice(-8);
    this.batchId = `SB-${stamp}`;
  }
  next();
});


module.exports = mongoose.model('SalesBatch', salesBatchSchema);  