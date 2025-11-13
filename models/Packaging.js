const mongoose = require("mongoose");

const packagingSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },

    productionBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Production",
      required: true,
    },

    productName: { type: String, required: true },

    totalProduced: { type: Number, required: true }, // from production
    packagedQuantity: { type: Number, required: true }, // how much packaged
    unit: { type: String, default: "kg" },

    packagingType: {
      type: String,
      enum: ["box", "bag", "carton", "packet"],
      required: true,
    },

    numberOfPackages: { type: Number, required: true },

    packagingMaterial: { type: String }, // e.g., plastic bag, box, etc.

    doneBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Packaging", packagingSchema);
