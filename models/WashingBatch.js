const mongoose = require('mongoose');

const gunUsageSchema = new mongoose.Schema({
  gun: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gun',  // ✅ Reference to Gun model
    required: true,
  },
  inputSmallLeaves: { type: Number, default: 0 },
  inputBigLeaves: { type: Number, default: 0 },
  damagedSmallLeaves: { type: Number, default: 0 },
  damagedBigLeaves: { type: Number, default: 0 },


  operatingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  goodSmallLeaves: { type: Number, default: 0 },
  goodBigLeaves: { type: Number, default: 0 },
  goodLeaves: { type: Number, default: 0 },
  openingGoodSmallLeaves: { type: Number, default: 0 },
  openingGoodBigLeaves: { type: Number, default: 0 },
  //consumedByMachines: { type: Number, default: 0 },
   returnedForRewashSmall: { type: Number, default: 0 },
   returnedForRewashBig: { type: Number, default: 0 },
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
  let goodSmallLeaves = 0;
  let goodBigLeaves = 0;
  let damagedBigLeaves = 0;
  let damagedSmallLeaves = 0;
  // let openingGoodSmallLeaves = 0;
  // let openingGoodBigLeaves = 0;
  if (this.guns && this.guns.length > 0) {
    this.guns.forEach(g => {
      totalInput += g.inputSmallLeaves + g.inputBigLeaves || 0;
      damagedLeaves += g.damagedBigLeaves + g.damagedSmallLeaves || 0;
      goodBigLeaves += g.inputBigLeaves;
      goodSmallLeaves += g.inputSmallLeaves;
      g.totalTimeMinutes += (g.endTime && g.startTime) ? (g.endTime - g.startTime) / (1000 * 60) : 0; // in minutes
      damagedBigLeaves += g.damagedBigLeaves
      damagedSmallLeaves += g.damagedSmallLeaves
    });
  }
  //this.totalInput = totalInput;
  this.sentToWash = totalInput;
  this.totalDamaged = damagedLeaves;
  //this.goodLeaves = this.sentToWash - this.totalDamaged - (this.returnedForRewashSmall + this.returnedForRewashBig);
  console.log(this.goodLeaves);
  this.goodBigLeaves = goodBigLeaves;
  this.goodSmallLeaves = goodSmallLeaves;
  this.goodLeaves = goodBigLeaves + goodSmallLeaves;
  console.log(this.goodLeaves);
  this.badLeavesPercent = this.goodLeaves ? ((this.totalDamaged / this.sentToWash) * 100).toFixed(2) : 0;
  this.washingDurationMinutes = this.guns.reduce((sum, g) => sum + (g.totalTimeMinutes || 0), 0);

  // this.openingGoodSmallLeaves += goodSmallLeaves;
  // this.openingGoodBigLeaves += goodBigLeaves;
 
  //this.totalTimeMinutes = totalTime;
  //console.log(totalTime);
  //opening stock
  //this. openingStock = openingWashedLeaves ? this.openingWashedLeaves + this.openingStock : 0;

  // Closing stock
  // this.closingStock =
  //   (this.openingStock + this.newCollected + this.openingWashedLeaves) -
  //   (this.consumedByMachines + this.returnedForRewash);
// readyToWashSmallLeaves
  // Generate batchId if missing
  if (!this.batchId) {
    const stamp = Date.now().toString(36).toUpperCase().slice(-8);
    this.batchId = `WB-${stamp}`;
  }
 const LeafInventory = mongoose.model('LeafInventory');
 //find leaf lintentory which is just one
    const inventoryRecord = await LeafInventory.findOne();
    if (inventoryRecord) {
     inventoryRecord.availableSmallLeaves += this.goodSmallLeaves;
     inventoryRecord.availableBigLeaves += this.goodBigLeaves;
     inventoryRecord.availableLeaves += this.goodLeaves;
    // inventoryRecord.sortedGoodLeaves = Math.max(0, inventoryRecord.sortedGoodLeaves - this.sentToWash);
    inventoryRecord.availableForWashing = Math.max(0, inventoryRecord.availableForWashing - this.sentToWash);
    inventoryRecord.availableSortedSmallLeaves -= (this.goodSmallLeaves + this.damagedSmallLeaves)
    inventoryRecord.availableSortedBigLeaves -= (this.goodBigLeaves + this.damagedBigLeaves)
    //inventoryRecord.availableSortedSmallLeaves = Math.max(0, inventoryRecord.availableSortedSmallLeaves - this.goodSmallLeaves - this.damagedSmallLeaves);
    //inventoryRecord.availableSortedBigLeaves = Math.max(0, inventoryRecord.availableSortedBigLeaves - this.goodBigLeaves - this.damagedBigLeaves);

    // //return to rewash wala logic
    inventoryRecord.readyToWashSmallLeaves += this.returnedForRewashSmall;
    inventoryRecord.readyToWashBigLeaves += this.returnedForRewashBig;

// if(this.openingGoodBigLeaves > 0 || this.openingGoodSmallLeaves >0){
  inventoryRecord.readyToWashSmallLeaves += this.openingGoodSmallLeaves;
  inventoryRecord.readyToWashBigLeaves += this.openingGoodBigLeaves;

  //done
  inventoryRecord.availableSortedSmallLeaves -= this.openingGoodSmallLeaves;
  inventoryRecord.availableSortedBigLeaves -= this.openingGoodBigLeaves;
//      console.log('greater');
// }else{
//      console.log('small');
// }
   inventoryRecord.readyToWashSmallLeaves -= (this.goodSmallLeaves + damagedSmallLeaves);
   inventoryRecord.readyToWashBigLeaves -= (this.goodBigLeaves + damagedBigLeaves);
     await inventoryRecord.save();
    }
  next();
});

module.exports = mongoose.model('WashingBatch', WashingBatchSchema);
