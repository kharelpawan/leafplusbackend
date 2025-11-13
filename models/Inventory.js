const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: {
      type: String,
      enum: ["raw", "semi-finished", "finished", "material"],
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse", // optional; create later if multi-warehouse setup
    },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "kg" },
    batchNo: { type: String },
    expiryDate: { type: Date },
    storageCondition: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
