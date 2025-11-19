const mongoose = require("mongoose");

const leafInventorySchema = new mongoose.Schema(
  {
    totalCollected: { type: Number, default: 0 },
    availableForSorting: { type: Number, default: 0 },
    sortedGoodLeaves: { type: Number, default: 0 },
    sortedRejectedLeaves: { type: Number, default: 0 },
    sortedSmallLeaves: {type: Number, default:0},
    sortedBigLeaves: {type: Number, default:0},
    availableSortedSmallLeaves: {type: Number, default:0},
    availableSortedBigLeaves: {type: Number, default:0},
    availableForWashing: { type: Number, default: 0 },
    readyToWashSmallLeaves: { type: Number, default: 0 },
    readyToWashBigLeaves: { type: Number, default: 0 },
    usedInProduction: { type: Number, default: 0 },
    availableLeaves: { type: Number, default: 0 },
    availableBigLeaves:{type: Number, default: 0},
    availableSmallLeaves:{type: Number, default: 0},
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeafInventory", leafInventorySchema);
