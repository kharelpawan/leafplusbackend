// const mongoose = require('mongoose');

// const gunSchema = new mongoose.Schema({
//   gunId: { type: String },           // A, B, C, D, E, F
//   inputLeaves: { type: Number, default: 0 },
//   outputLeaves: { type: Number, default: 0 }
// });

// const WashingBatchSchema = new mongoose.Schema({
//   batchId: { type: String, unique: true, index: true },
//   date: { type: Date, default: Date.now },

//   sourceSortingBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'SortingBatch', required: true },
//   operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

//   openingStock: { type: Number, default: 0 },
//   newCollected: { type: Number, default: 0 },
//   openingWashedLeaves: { type: Number, default: 0 },

//   guns: [gunSchema], // gun-wise details

//   totalWashed: { type: Number, default: 0 },
//   totalDamaged: { type: Number, default: 0 },
//   goodLeaves: { type: Number, default: 0 },
//   consumedByMachines: { type: Number, default: 0 },
//   returnedForRewash: { type: Number, default: 0 },
//   closingStock: { type: Number, default: 0 },
//   badLeavesPercent: { type: Number, default: 0 },

//   washingDurationMinutes: { type: Number, default: 0 },
//   remarks: { type: String },

//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// WashingBatchSchema.pre('save', function (next) {
//   // calculate derived fields
//   let totalInput = 0;
//   let totalOutput = 0;

//   this.guns?.forEach(g => {
//     totalInput += g.inputLeaves || 0;
//     totalOutput += g.outputLeaves || 0;
//   });

//   this.totalWashed = totalOutput;
//   this.goodLeaves = totalOutput - this.totalDamaged;
//   this.badLeavesPercent = totalOutput ? ((this.totalDamaged / totalOutput) * 100).toFixed(2) : 0;

//   // Closing stock calculation
//   this.closingStock =
//     (this.openingStock + this.newCollected + this.openingWashedLeaves) -
//     (this.consumedByMachines + this.returnedForRewash);

//   if (!this.batchId) {
//     const stamp = Date.now().toString(36).toUpperCase().slice(-8);
//     this.batchId = `WB-${stamp}`;
//   }

//   next();
// });

// module.exports = mongoose.model('WashingBatch', WashingBatchSchema);


const mongoose = require('mongoose');

const gunUsageSchema = new mongoose.Schema({
  gun: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gun',  // ✅ Reference to Gun model
    required: true,
  },
  inputLeaves: { type: Number, default: 0 },
  damagedLeaves: { type: Number, default: 0 },
  operatingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  //include start and end time for each gun usage
  startTime: { type: Date },
  endTime: { type: Date },
  totalTimeMinutes: { type: Number, default: 0 }
});
//console.log(gunUsageSchema);
const WashingBatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true, index: true },
  date: { type: Date, default: Date.now },

 
  //operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  //verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  //openingStock: { type: Number, default: 0 },
  //newCollected: { type: Number, default: 0 },
  //openingWashedLeaves: { type: Number, default: 0 },

  guns: [gunUsageSchema], //  Array of guns used in washing
  sentToWash: { type: Number, default: 0 },
  totalDamaged: { type: Number, default: 0 },
  goodLeaves: { type: Number, default: 0 },
  //consumedByMachines: { type: Number, default: 0 },
  returnedForRewash: { type: Number, default: 0 },
  //closingStock: { type: Number, default: 0 },
  badLeavesPercent: { type: Number, default: 0 },

  washingDurationMinutes: { type: Number, default: 0 },
  remarks: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-calc before save
WashingBatchSchema.pre('save', async function (next) {
  let totalInput = 0;
  let damagedLeaves = 0;
  if (this.guns && this.guns.length > 0) {
    this.guns.forEach(g => {
      totalInput += g.inputLeaves || 0;
      damagedLeaves += g.damagedLeaves || 0;
      g.totalTimeMinutes += (g.endTime && g.startTime) ? (g.endTime - g.startTime) / (1000 * 60) : 0; // in minutes
    });
  }
  //this.totalInput = totalInput;
  this.sentToWash = totalInput;
  this.totalDamaged = damagedLeaves;
  this.goodLeaves = this.sentToWash - this.totalDamaged - this.returnedForRewash;
  this.badLeavesPercent = this.goodLeaves ? ((this.totalDamaged / this.sentToWash) * 100).toFixed(2) : 0;
  this.washingDurationMinutes = this.guns.reduce((sum, g) => sum + (g.totalTimeMinutes || 0), 0);
  //this.totalTimeMinutes = totalTime;
  //console.log(totalTime);
  //opening stock
  //this. openingStock = openingWashedLeaves ? this.openingWashedLeaves + this.openingStock : 0;

  // Closing stock
  this.closingStock =
    (this.openingStock + this.newCollected + this.openingWashedLeaves) -
    (this.consumedByMachines + this.returnedForRewash);

  // Generate batchId if missing
  if (!this.batchId) {
    const stamp = Date.now().toString(36).toUpperCase().slice(-8);
    this.batchId = `WB-${stamp}`;
  }
const LeafInventory = mongoose.model('LeafInventory');
//find leaf lintentory which is just one
    const inventoryRecord = await LeafInventory.findOne();
    if (inventoryRecord) {
     inventoryRecord.availableLeaves += this.goodLeaves;
    // inventoryRecord.sortedGoodLeaves = Math.max(0, inventoryRecord.sortedGoodLeaves - this.sentToWash);
     inventoryRecord.availableForWashing = Math.max(0, inventoryRecord.availableForWashing - this.sentToWash);
     await inventoryRecord.save();   
    }
  next();
});

module.exports = mongoose.model('WashingBatch', WashingBatchSchema);
