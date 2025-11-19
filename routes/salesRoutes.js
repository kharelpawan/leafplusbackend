// module.exports = router;
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createSalesBatch, getSalesBatch
} = require('../controllers/salesController.js');

const { protect, authorize } = require('../middleware/auth');

router.post(
  '/',
  protect,
  authorize('factorymanager','superadmin'), createSalesBatch
);

 router.get('/', protect, authorize('factorymanager','headofficeadmin','superadmin'), getSalesBatch);
// router.get('/report/daily', protect, authorize('factorymanager','headofficeadmin','superadmin'), dailyWashingReport);
// router.get('/:id', protect, getWashingBatch);
// router.put('/:id', protect, authorize('factorymanager','superadmin'), updateWashingBatch);
// router.delete('/:id', protect, authorize('superadmin'), deleteWashingBatch);

module.exports = router;
