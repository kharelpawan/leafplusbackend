const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createProductionBatch,
  getProductionBatches,
  getProductionBatch,
  updateProductionBatch,
  deleteProductionBatch,
  dailyProductionReport,
  machineUtilizationReport,
  downtimeReasonsReport
} = require('../controllers/productionController');

const { protect, authorize } = require('../middleware/auth');

// Create production batch
router.post(
  '/',
  protect,
  authorize('factorymanager','superadmin','productionmanager'), // productionmanager may be optional if you add it
  [
    //body('machine').notEmpty().withMessage('machine is required'),
    body('inputLeaves').isNumeric().withMessage('inputLeaves numeric'),
    body('goodOutput').isNumeric().withMessage('goodOutput numeric'),
    body('damagedOutput').isNumeric().withMessage('damagedOutput numeric')
  ],
  createProductionBatch
);

// List
router.get('/', protect, authorize('factorymanager','headofficeadmin','headofficeaccountant','superadmin'), getProductionBatches);

// Reports
router.get('/report/daily', protect, authorize('factorymanager','headofficeadmin','headofficeaccountant','superadmin'), dailyProductionReport);
router.get('/report/machine-utilization', protect, authorize('factorymanager','headofficeadmin','superadmin'), machineUtilizationReport);
router.get('/report/downtime-reasons', protect, authorize('factorymanager','headofficeadmin','superadmin'), downtimeReasonsReport);

router.get('/:id', protect, getProductionBatch);
router.put('/:id', protect, authorize('factorymanager','superadmin'), updateProductionBatch);
router.delete('/:id', protect, authorize('superadmin'), deleteProductionBatch);

module.exports = router;
