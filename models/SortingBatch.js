// module.exports = mongoose.model('SortingBatch', SortingBatchSchema);
const mongoose = require('mongoose');
const { generateBatchId } = require('../utils/batchIdGenerator');

const SortingBatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true, index: true, default: generateBatchId},
  date: { type: Date, default: Date.now },

  sourceCollections: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  //operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  //countDifference: { type: Number, default: 0 },
  // counts before/after sorting
  preSortingCountC1: { type: Number, default: 0 },
  smallSortingCount: {type: Number, default: 0},
  bigSortingCount:{type: Number, default:0},
  postSortingCountC2: { type: Number, default: 0 },
  usableCount: { type: Number, default: 0 },
  damagedCount: { type: Number, default: 0 },

  // percentages / durations
  damagePercent: { type: Number, default: 0 },
  sortingDurationMinutes: { type: Number, default: 0 },

  // size classification per batch
  //qualityCategory: { type: String, enum: ['small', 'large'], default: 'small' },

  remarks: { type: String },
  //createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

SortingBatchSchema.pre('save', async function (next) {
  try {
    //  fetch preSortingCountC1 from Collection if available
    if (this.sourceCollections) {
      const collection = await mongoose.model('Collection')
        .findById(this.sourceCollections)
        .select('countc1 status')
        .lean();
        //console.log(collection);
      //  check if countc1 exists (case-sensitive)
      if (collection && collection.countc1 !== undefined && collection.countc1 !== null) {
        this.preSortingCountC1 = Number(collection.countc1);
        collection.status = 'sorted'
      }else{
        this.preSortingCountC1 = 0;
      }
    }
    
    //  ensure all numbers are safe
    this.preSortingCountC1 = Number(this.preSortingCountC1 || 0);
    this.postSortingCountC2 = Number(this.smallSortingCount + this.bigSortingCount);
    console.log(this.postSortingCountC2);
    this.damagedCount = Number(this.preSortingCountC1 - this.postSortingCountC2 || 0);
    //this.countDifference = this.preSortingCountC1 - this.postSortingCountC2 - this.damagedCount;
    this.usableCount = Number(this.postSortingCountC2 || 0);
    
const preCount = this.preSortingCountC1;
    //  compute damaged count if not provided
    // if (!this.damagedCount && this.preSortingCountC1) {
    //   this.damagedCount = Math.max(0, this.preSortingCountC1 - this.usableCount);
    // }
//update LeafInventory models value of sortedGoodLeaves after sorting batch is created
    const LeafInventory = mongoose.model('LeafInventory');
//find leaf lintentory which is just one
    const inventoryRecord = await LeafInventory.findOne();
    if (inventoryRecord) {
     inventoryRecord.sortedGoodLeaves += this.postSortingCountC2;
     inventoryRecord.sortedSmallLeaves += this.smallSortingCount;
     inventoryRecord.sortedBigLeaves += this.bigSortingCount; 
      inventoryRecord.availableSortedSmallLeaves += this.smallSortingCount;
     inventoryRecord.availableSortedBigLeaves += this.bigSortingCount;
     inventoryRecord.sortedRejectedLeaves += this.damagedCount;
     const leavesProcessedInBatch = preCount; 
        console.log(leavesProcessedInBatch);
        // Ensure the total doesn't go below zero
        inventoryRecord.availableForSorting = Math.max(0,
            inventoryRecord.availableForSorting - leavesProcessedInBatch
        );
        inventoryRecord.availableForWashing += this.postSortingCountC2;
     await inventoryRecord.save();   
    }
    //  compute damage percent safely
    const totalForPercent = this.postSortingCountC2;
    this.damagePercent = totalForPercent
      ? (this.damagedCount / totalForPercent) * 100
      : 0;

//     //  auto-generate batchId
    if (!this.batchId) {
      //take stamp as date and time
      const stamp = Date.now();
const dateObject = new Date(stamp);

// Generate a string in the format YYYYMMDD_HHmmssSSS (e.g., 20251112_115535876)
const year = dateObject.getFullYear();
const month = String(dateObject.getMonth() + 1).padStart(2, '0');
const day = String(dateObject.getDate()).padStart(2, '0');
const hours = String(dateObject.getHours()).padStart(2, '0');
const minutes = String(dateObject.getMinutes()).padStart(2, '0');
const seconds = String(dateObject.getSeconds()).padStart(2, '0');
const milliseconds = String(dateObject.getMilliseconds()).padStart(3, '0');

const timeStampPart = `${year}${month}${day}_${hours}${minutes}${seconds}${milliseconds}`;

// Final Batch ID structure: SB-YYYYMMDD_HHmmssSSS
this.batchId = `SB-${timeStampPart}`;
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('SortingBatch', SortingBatchSchema);
