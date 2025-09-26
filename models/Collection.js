const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  collectionId: { type: String, unique: true, index: true },
  date: { type: Date, default: Date.now },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modeOfCollection: { type: String, enum: ['dropoff', 'pickup', 'thirdparty'], default: 'dropoff' },
  vehicleId: { type: String },
  sourceLocation: { type: String },
  leafType: { type: String },
  //grossWeight: { type: Number, default: 0 },
  netWeight: { type: Number, default: 0 },
  countc1: { type: Number, default: 0 },
  ratePerKg: { type: Number, default: 0 },
  transportCharges: { type: Number, default: 0 },
  totalPayable: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
  // signatures: {
  //   collectorSignature: String,
  //   receiverSignature: String
  // },
  remarks: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// generate collectionId and calculate totalPayable before save
CollectionSchema.pre('save', function (next) {
  if (!this.collectionId) {
    this.collectionId = 'COL-' + Date.now().toString(36).toUpperCase().slice(-9);
  }
  // compute using netWeight and rate
  if (this.ratePerKg != null && this.netWeight != null) {
    this.totalPayable = (this.ratePerKg * this.netWeight) - (this.transportCharges || 0);
  }
  next();
});

module.exports = mongoose.model('Collection', CollectionSchema);
