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

  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  die: { type: mongoose.Schema.Types.ObjectId, ref: 'Die' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  sourceWashingBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'WashingBatch' },

  inputLeaves: { type: Number, default: 0 },
  productName: { type: String, },
  goodOutput: { type: Number, default: 0 },
  damagedOutput: { type: Number, default: 0 },
  totalOutput: { type: Number, default: 0 },

  percentGood: { type: Number, default: 0 },
  percentDamaged: { type: Number, default: 0 },

  downtime: [downtimeSchema],
  dieChanges: [dieChangeSchema],

  remarks: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ProductionBatchSchema.pre('save', function (next) {
  // compute totals and percentages
  this.inputLeaves = Number(this.inputLeaves || 0);
  this.goodOutput = Number(this.goodOutput || 0);
  this.damagedOutput = Number(this.damagedOutput || 0);
  //get product name from die if not set
  if (!this.productName && this.die) {
    Die.findById(this.die).select('productName').then(dieData => {
      if (dieData && dieData.productName) {
        this.productName = dieData.productName;
      }
    }).catch(err => {
      // handle error if needed
      console.log(err);
    });
  }

  this.totalOutput = this.goodOutput + this.damagedOutput;

  this.percentGood = this.totalOutput ? ((this.goodOutput / this.totalOutput) * 100) : 0;
  this.percentDamaged = this.totalOutput ? ((this.damagedOutput / this.totalOutput) * 100) : 0;

  // compute downtime durations
  let totalDowntime = 0;
  if (Array.isArray(this.downtime)) {
    this.downtime = this.downtime.map(d => {
      // ensure Date objects
      if (d.startTime && d.endTime) {
        const dur = Math.max(0, (new Date(d.endTime).getTime() - new Date(d.startTime).getTime()) / 60000);
        d.durationMinutes = Math.round(dur);
        totalDowntime += d.durationMinutes;
      } else {
        d.durationMinutes = d.durationMinutes || 0;
      }
      return d;
    });
  }
  // optional: store in metadata if needed
  // this.totalDowntimeMinutes = totalDowntime;
  // get product name automatically from Die
    // if (this.die) {
    //   const dieData =  Die.findById(this.die).select('productName');
    //   if (dieData && dieData.productName) {
    //     this.productName = dieData.productName;
    //   }
    // }

  // generate batchId if missing
  if (!this.batchId) {
    const stamp = Date.now().toString(36).toUpperCase().slice(-8);
    this.batchId = `PB-${stamp}`;
  }

  next();
});

module.exports = mongoose.model('ProductionBatch', ProductionBatchSchema);
