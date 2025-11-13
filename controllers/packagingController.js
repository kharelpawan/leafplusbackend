const Packaging = require("../models/Packaging");
const Inventory = require("../models/Inventory");

exports.createPackaging = async (req, res) => {
  try {
    const {
      productionBatch,
      productName,
      totalProduced,
      packagedQuantity,
      packagingType,
      numberOfPackages,
      packagingMaterial,
      doneBy,
      remarks,
    } = req.body;

    const packaging = await Packaging.create({
      productionBatch,
      productName,
      totalProduced,
      packagedQuantity,
      packagingType,
      numberOfPackages,
      packagingMaterial,
      doneBy,
      remarks,
    });


    await Inventory.findOneAndUpdate(
      { itemName: productName, category: "finished" },
      { $inc: { quantity: -packagedQuantity } },
      { new: true }
    );

    await Inventory.findOneAndUpdate(
      { itemName: `${productName} (${packagingType})`, category: "finished" },
      { $inc: { quantity: packagedQuantity } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Packaging record created and inventory updated successfully.",
      packaging,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getPackagingRecords = async (req, res) => {
  try {
    const records = await Packaging.find()
      .populate("productionBatch")
      .populate("doneBy", "name role");
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getPackagingRecord = async (req, res) => {
  try {
    const record = await Packaging.findById(req.params.id)
      .populate("productionBatch")
      .populate("doneBy", "name role");
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updatePackaging = async (req, res) => {
  try {
    const updated = await Packaging.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Packaging record updated", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deletePackaging = async (req, res) => {
  try {
    await Packaging.findByIdAndDelete(req.params.id);
    res.json({ message: "Packaging record deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
