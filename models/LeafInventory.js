const mongoose = require("mongoose");

const leafInventorySchema = new mongoose.Schema(
  {
    totalCollected: { type: Number, default: 0 },
    availableForSorting: { type: Number, default: 0 },
    sortedGoodLeaves: { type: Number, default: 0 },
    sortedRejectedLeaves: { type: Number, default: 0 },
    availableForWashing: { type: Number, default: 0 },
    usedInProduction: { type: Number, default: 0 },
    availableLeaves: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeafInventory", leafInventorySchema);
