const mongoose = require('mongoose');

const gunSchema = new mongoose.Schema({
  gunId: { type: String },           // A, B, C, D, E, F
  inputLeaves: { type: Number, default: 0 },
  outputLeaves: { type: Number, default: 0 }
});

const WashingBatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true, index: true },
  date: { type: Date, default: Date.now },

  sourceSortingBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'SortingBatch', required: true },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  openingStock: { type: Number, default: 0 },
  newCollected: { type: Number, default: 0 },
  openingWashedLeaves: { type: Number, default: 0 },

  guns: [gunSchema], // gun-wise details

  totalWashed: { type: Number, default: 0 },
  totalDamaged: { type: Number, default: 0 },
  goodLeaves: { type: Number, default: 0 },
  consumedByMachines: { type: Number, default: 0 },
  returnedForRewash: { type: Number, default: 0 },
  closingStock: { type: Number, default: 0 },
  badLeavesPercent: { type: Number, default: 0 },

  washingDurationMinutes: { type: Number, default: 0 },
  remarks: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

WashingBatchSchema.pre('save', function (next) {
  // calculate derived fields
  let totalInput = 0;
  let totalOutput = 0;

  this.guns?.forEach(g => {
    totalInput += g.inputLeaves || 0;
    totalOutput += g.outputLeaves || 0;
  });

  this.totalWashed = totalOutput;
  this.goodLeaves = totalOutput - this.totalDamaged;
  this.badLeavesPercent = totalOutput ? ((this.totalDamaged / totalOutput) * 100).toFixed(2) : 0;

  // Closing stock calculation
  this.closingStock =
    (this.openingStock + this.newCollected + this.openingWashedLeaves) -
    (this.consumedByMachines + this.returnedForRewash);

  if (!this.batchId) {
    const stamp = Date.now().toString(36).toUpperCase().slice(-8);
    this.batchId = `WB-${stamp}`;
  }

  next();
});

module.exports = mongoose.model('WashingBatch', WashingBatchSchema);
