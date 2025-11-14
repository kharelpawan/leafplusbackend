const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machineId: { type: String, required: true, unique: true }, // e.g., MCH-001
  name: { type: String, required: true },
  location: { type: String }, // factory/line
  status: { type: String, enum: ['active','inactive','maintenance'], default: 'active' },
  //list of dies associated with this machine
  dies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Die' }],
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Machine', MachineSchema);
