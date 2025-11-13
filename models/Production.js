const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    // shift: { type: String, enum: ["morning", "evening", "night"], required: true },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      // required: true,
    },
    die: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Die",
      // required: true,
    },
    // productName: { type: String, required: true },
    // inputLeaves: { type: Number, required: true },
    // goodOutput: { type: Number, required: true },
    // damagedOutput: { type: Number, required: true },
    // totalOutput: { type: Number, required: true },
    percentGood: { type: Number },
    percentDamaged: { type: Number },
    downtimeDuration: { type: Number, default: 0 }, // in minutes
    downtimeReason: { type: String },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook to calculate % good and % damaged
productionSchema.pre("save", function (next) {
  if (this.totalOutput > 0) {
    this.percentGood = ((this.goodOutput / this.totalOutput) * 100).toFixed(2);
    this.percentDamaged = ((this.damagedOutput / this.totalOutput) * 100).toFixed(2);
  }
  next();
});

module.exports = mongoose.model("Production", productionSchema);
