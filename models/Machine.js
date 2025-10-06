const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machineId: { type: String, required: true, unique: true }, // e.g., MCH-001
  name: { type: String, required: true },
  location: { type: String }, // factory/line
  status: { type: String, enum: ['active','inactive','maintenance'], default: 'active' },
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Machine', MachineSchema);
