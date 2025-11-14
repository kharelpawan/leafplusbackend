const mongoose = require('mongoose');
//import collectorUser to update total pending amount
const CollectorUser = require('./collectorUser');
const { generateBatchId } = require('../utils/batchIdGenerator');


//console.log("hi"+CollectorUser);
const CollectionSchema = new mongoose.Schema({
  //pass a value to generateBatchId function
  collectionId: { type: String, unique: true, index: true , default: generateBatchId},
  date: { type: Date, default: Date.now },
  //yo collector lai ksle pat pathako tyo user ko id line
  collector: { type: String, index: true, required:true },//pat ko owner
  modeOfCollection: { type: String, enum: ['dropoff', 'pickup'], default: 'dropoff' },
  vehicleId: { type: String },
  sourceLocation: { type: String },
  leafType: { type: String },
  //grossWeight: { type: Number, default: 0 },

  countc1: { type: Number, default: 0 },
  rate: { type: Number, default: 5 },//rate per pc ko ho kg haina
  transportCharges: { type: Number, default: 0 },
  //ne wadded units 2
  fuelCharges: { type: Number, default: 0 },
  labourCharges: { type: Number, default: 0 },

  totalPayable: { type: Number, default: 0 },
  totalExpenses: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
  paidAmount: { type: Number, default: 0 },
  toBePaidAmount: { type: Number, default: 0 },
  // signatures: {
  //   collectorSignature: String,
  //   receiverSignature: String
  // },
  remarks: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// generate collectionId and calculate totalPayable before save
CollectionSchema.pre('save', async function (next) {
  if (!this.collectionId) {
    this.collectionId = 'COL-' + Date.now().toString(36).toUpperCase().slice(-9);
  }
const LeafInventory = mongoose.model('LeafInventory');
//find leaf lintentory which is just one
    const inventoryRecord = await LeafInventory.findOne();
    if (inventoryRecord) {
     inventoryRecord.totalCollected+= this.countc1;
     inventoryRecord.availableForSorting += this.countc1;
     await inventoryRecord.save();   
    }
  //drop off condition for transport charges
  if (this.modeOfCollection === 'pickup') {
    this.totalPayable = (this.rate * this.countc1);
    this.totalExpenses = this.totalPayable + (this.transportCharges || 0) + (this.fuelCharges || 0) + (this.labourCharges || 0);
    this.toBePaidAmount = this.totalPayable - this.paidAmount;
  }else{
    this.totalPayable = (this.rate * this.countc1);
    this.totalExpenses = this.totalPayable;
    this.toBePaidAmount = this.totalPayable - this.paidAmount;
  } 
  //update pending amount, totalLeavesCollected of collector user after collection is saved
  CollectorUser.findOneAndUpdate(
    { collector: this.collector },
    { $inc: { pendingAmounts: this.toBePaidAmount } },
     { $inc: { totalLeavesCollected: this.totalLeavesCollected + this.countc1 } },
    { new: true }
  ).then(() => {
    next();
  }).catch(err => {
    console.error('Error updating CollectorUser pendingAmounts:', err);
    next(err);
  });
  next();
});

module.exports = mongoose.model('Collection', CollectionSchema);
