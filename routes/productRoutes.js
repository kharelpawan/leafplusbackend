const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getProducts)
  .post(protect, authorize('superadmin', 'factorymanager', 'headofficeadmin'), createProduct);

router
  .route('/:id')
  .get(protect, getProduct)
  .put(protect, authorize('superadmin', 'factorymanager', 'headofficeadmin'), updateProduct)
  .delete(protect, authorize('superadmin', 'headofficeadmin'), deleteProduct);

module.exports = router;
