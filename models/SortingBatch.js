const mongoose = require('mongoose');

const SortingBatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true, index: true },
  date: { type: Date, default: Date.now },

  // link to collection record(s) that supplied the leaves
  sourceCollections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],

  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // counts before/after sorting
  preSortingCountC1: { type: Number, default: 0 }, 
  postSortingCountC2: { type: Number, default: 0 },
  usableCount: { type: Number, default: 0 },
  damagedCount: { type: Number, default: 0 },

  // percentages / durations
  damagePercent: { type: Number, default: 0 },
  sortingDurationMinutes: { type: Number, default: 0 },

  // quality classification per batch (optional)
  qualityCategory: { type: String, enum: ['premium','standard','reject','mixed'], default: 'standard' },

  remarks: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

SortingBatchSchema.pre('save', function (next) {
  // compute derived values
  try {
    // ensure counts are numbers
    this.preSortingCountC1 = Number(this.preSortingCountC1 || 0);
    this.postSortingCountC2 = Number(this.postSortingCountC2 || 0);
    this.usableCount = Number(this.usableCount || 0);
    this.damagedCount = Number(this.damagedCount || 0);

    // if damaged count not provided, derive from pre/post counts
    if (!this.damagedCount && this.preSortingCountC1) {
      this.damagedCount = Math.max(0, this.preSortingCountC1 - this.usableCount);
    }

    const totalForPercent = this.preSortingCountC1 || (this.postSortingCountC2 || 0) || 0;
    this.damagePercent = totalForPercent ? (this.damagedCount / totalForPercent) * 100 : 0;

    // generate batchId if not present
    if (!this.batchId) {
      const stamp = Date.now().toString(36).toUpperCase().slice(-8);
      this.batchId = `SB-${stamp}`;
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('SortingBatch', SortingBatchSchema);
