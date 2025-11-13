const Product = require('../models/Product');

// @desc Get all products
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('createdBy', 'name role');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc Get single product
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name role');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc Create product
exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create({
      ...req.body,
      createdBy: req.user ? req.user._id : null
    });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// @desc Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
