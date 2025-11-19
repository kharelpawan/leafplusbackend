//get data from productInventory.js
const ProductInventory = require('../models/ProductInventory');

// @desc Get all product inventories
exports.getProductInventories = async (req, res, next) => {
  try {
    const inventories = await ProductInventory.find();
    res.status(200).json(inventories);
  } catch (error) {
    next(error);
  }
};

// @desc Get a single product inventory by ID
exports.getProductInventory = async (req, res, next) => {
  try {
    const inventory = await ProductInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Product Inventory not found' });
    }
    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
};      