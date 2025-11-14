const mongoose = require('mongoose');
const Die = require('./Die');
const downtimeSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: false },
  durationMinutes: { type: Number, default: 0 }, // computed
  reason: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const dieChangeSchema = new mongoose.Schema({
  fromDie: { type: mongoose.Schema.Types.ObjectId, ref: 'Die' },
  toDie: { type: mongoose.Schema.Types.ObjectId, ref: 'Die' },
  changeTime: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const ProductionBatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true, index: true },
  date: { type: Date, default: Date.now },
  shift: { type: String, enum: ['morning','afternoon','night','other'], default: 'morning' },

  //machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  die: { type: mongoose.Schema.Types.ObjectId, ref: 'Die' },
  //product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  //sourceWashingBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'WashingBatch' },

  inputLeaves: { type: Number, default: 0 },
  productName: { type: String, },
  goodOutput: { type: Number, default: 0 },
  damagedOutput: { type: Number, default: 0 },
  //totalOutput: { type: Number, default: 0 },

  percentGood: { type: Number, default: 0 },
  percentDamaged: { type: Number, default: 0 },
  startTime: { type: Date },
  endTime: { type: Date },
  //downtime: [downtimeSchema],
  //dieChanges: [dieChangeSchema],

  remarks: { type: String },
  //createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Change the function signature to async
ProductionBatchSchema.pre('save', async function (next) {
  try {
    // compute totals and percentages
    this.inputLeaves = Number(this.inputLeaves || 0);
    this.goodOutput = Number(this.goodOutput || 0);
    this.damagedOutput = Number(this.damagedOutput || 0);
    this.totalOutput = this.goodOutput + this.damagedOutput;

    this.percentGood = this.totalOutput ? ((this.goodOutput / this.totalOutput) * 100) : 0;
    this.percentDamaged = this.totalOutput ? ((this.damagedOutput / this.totalOutput) * 100) : 0;
    
    // --- FIX: Await the database call ---
    const dieModel = mongoose.model('Die');
    
    if (this.die) {
        // Use await to pause until the die data is fetched
        const dieData = await dieModel.findById(this.die).select('productName').lean();
        
        if (dieData && dieData.productName) {
            this.productName = dieData.productName;
            
        } else {
            // Set a default or handle the case where the die is not found/lacks product name
            this.productName = ''; 
        }
    } else {
        this.productName = '';
    } 
    // --- END FIX ---
    
    // generate batchId if missing
    if (!this.batchId) {
        const stamp = Date.now().toString(36).toUpperCase().slice(-8);
        this.batchId = `PB-${stamp}`;
    }
const LeafInventory = mongoose.model('LeafInventory');
//find leaf lintentory which is just one
    const inventoryRecord = await LeafInventory.findOne();
    if (inventoryRecord) {
     inventoryRecord.availableLeaves = inventoryRecord.availableLeaves-  this.inputLeaves;
    inventoryRecord.usedInProduction += this.inputLeaves;
     await inventoryRecord.save();   
    }
    //import ProductInventory model
    const ProductInventory = mongoose.model('ProductInventory');
    
    //find product inventory by product name
    let productInventoryRecord = await ProductInventory.findOne({ productName: this.productName });
    if(productInventoryRecord){
    productInventoryRecord.totalProduced += this.goodOutput + this.damagedOutput;
    productInventoryRecord.availableQuantity += this.goodOutput;
    productInventoryRecord.lastUpdated = new Date();
    await productInventoryRecord.save();
  }else{
      //create new product inventory
      await ProductInventory.create({
        productName: this.productName,
        totalProduced: this.goodOutput + this.damagedOutput,
        availableQuantity: this.goodOutput,
        lastUpdated: new Date()
      });
    } 
    // Call next() ONLY after all async operations are complete
    next();
  } catch (err) {
    // If any database error occurs, pass it to Mongoose to stop the save operation
    console.error('Error during ProductionBatch pre-save hook:', err);
    next(err);
  }
});
module.exports = mongoose.model('ProductionBatch', ProductionBatchSchema);
