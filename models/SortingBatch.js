// const mongoose = require('mongoose');

// const SortingBatchSchema = new mongoose.Schema({
//   batchId: { type: String, unique: true, index: true },
//   date: { type: Date, default: Date.now },
//   // link to collection record(s) that supplied the leaves
//   //sourceCollections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
// //sourceSortingBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'SortingBatch', required: true },
  
//   sourceCollections: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
//   operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

//   // counts before/after sorting
//   preSortingCountC1: { type: Number, default: 0 }, //verify garnu oparxa ki nai 
//   postSortingCountC2: { type: Number, default: 0 },
//   usableCount: { type: Number, default: 0 },
//   damagedCount: { type: Number, default: 0 },

//   // percentages / durations
//   damagePercent: { type: Number, default: 0 },
//   sortingDurationMinutes: { type: Number, default: 0 },

//   // quality classification per batch (optional)
//   qualityCategory: { type: String, enum: ['premium','standard','reject','mixed'], default: 'standard' },

//   remarks: { type: String },

//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// SortingBatchSchema.pre('save', function (next) {
//   // compute derived values
//   try {
//     // ensure counts are numbers
//     this.preSortingCountC1 = Number(this.preSortingCountC1 || 0);
//     this.postSortingCountC2 = Number(this.postSortingCountC2 || 0);
//     this.usableCount = Number(this.usableCount || 0);
//     this.damagedCount = Number(this.damagedCount || 0);

//     // if damaged count not provided, derive from pre/post counts
//     if (!this.damagedCount && this.preSortingCountC1) {
//       this.damagedCount = Math.max(0, this.preSortingCountC1 - this.usableCount);
//     }

//     const totalForPercent = this.preSortingCountC1 || (this.postSortingCountC2 || 0) || 0;
//     this.damagePercent = totalForPercent ? (this.damagedCount / totalForPercent) * 100 : 0;

//     // generate batchId if not present
//     if (!this.batchId) {
//       const stamp = Date.now().toString(36).toUpperCase().slice(-8);
//       this.batchId = `SB-${stamp}`;
//     }

//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = mongoose.model('SortingBatch', SortingBatchSchema);
const mongoose = require('mongoose');
const { generateBatchId } = require('../utils/batchIdGenerator');

const SortingBatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true, index: true, default: generateBatchId},
  date: { type: Date, default: Date.now },

  sourceCollections: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  //operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operator: { type: String, index: true, required:true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  countDifference: { type: Number, default: 0 },
  // counts before/after sorting
  preSortingCountC1: { type: Number, default: 0 },
  postSortingCountC2: { type: Number, default: 0 },
  usableCount: { type: Number, default: 0 },
  damagedCount: { type: Number, default: 0 },

  // percentages / durations
  damagePercent: { type: Number, default: 0 },
  sortingDurationMinutes: { type: Number, default: 0 },

  // quality classification per batch (optional)
  qualityCategory: { type: String, enum: ['premium', 'standard', 'reject', 'mixed'], default: 'standard' },

  remarks: { type: String },
  //createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

SortingBatchSchema.pre('save', async function (next) {
  try {
    //  fetch preSortingCountC1 from Collection if available
    if (this.sourceCollections) {
      const collection = await mongoose.model('Collection')
        .findById(this.sourceCollections)
        .select('countc1')
        .lean();
      //  check if countc1 exists (case-sensitive)
      if (collection && collection.countc1 !== undefined && collection.countc1 !== null) {
        this.preSortingCountC1 = Number(collection.countc1);
      }else{
        this.preSortingCountC1 = 0;
      }
    }
    
    //  ensure all numbers are safe
    this.preSortingCountC1 = Number(this.preSortingCountC1 || 0);
    this.postSortingCountC2 = Number(this.postSortingCountC2 || 0);
    this.countDifference = this.preSortingCountC1 - this.postSortingCountC2;
    this.usableCount = Number(this.postSortingCountC2 - this.damagedCount || 0);
    this.damagedCount = Number(this.damagedCount || 0);
const preCount = this.preSortingCountC1;
    //  compute damaged count if not provided
    if (!this.damagedCount && this.preSortingCountC1) {
      this.damagedCount = Math.max(0, this.preSortingCountC1 - this.usableCount);
    }
//update LeafInventory models value of sortedGoodLeaves after sorting batch is created
    const LeafInventory = mongoose.model('LeafInventory');
//find leaf lintentory which is just one
    const inventoryRecord = await LeafInventory.findOne();
    if (inventoryRecord) {
     inventoryRecord.sortedGoodLeaves += this.usableCount;
     inventoryRecord.sortedRejectedLeaves += this.damagedCount;
     const leavesProcessedInBatch = preCount; 
        console.log(leavesProcessedInBatch);
        // Ensure the total doesn't go below zero
        inventoryRecord.availableForSorting = Math.max(0,
            inventoryRecord.availableForSorting - leavesProcessedInBatch
        );
        inventoryRecord.availableForWashing += this.usableCount;
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
