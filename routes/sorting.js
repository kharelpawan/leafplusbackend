const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createSortingBatch,
  getSortingBatches,
  getSortingBatch,
  updateSortingBatch,
  deleteSortingBatch,
  dailyDamageReport
} = require('../controllers/sortingController');

const { protect, authorize } = require('../middleware/auth');

/**
 * Roles:
 * - Creating/updating sorting batches: factorymanager, superadmin (maybe collector can create but usually operator does)
 * - Viewing: factorymanager, storemanager, headofficeadmin, headofficeaccountant, superadmin
 * - Deleting: superadmin only
 */

router.post(
  '/',
  protect,
  authorize('factorymanager','superadmin'),
  [
    body('sourceCollections').optional().isArray(),
    body('preSortingCountC1').isNumeric().withMessage('preSortingCountC1 numeric'),
    body('usableCount').isNumeric().withMessage('usableCount numeric')
  ],
  createSortingBatch
);

router.get('/', protect, authorize('factorymanager','storemanager','headofficeadmin','headofficeaccountant','accountantmanager','superadmin'), getSortingBatches);
router.get('/report/daily-damage', protect, authorize('factorymanager','headofficeadmin','headofficeaccountant','superadmin'), dailyDamageReport);

router.get('/:id', protect, getSortingBatch);

router.put('/:id', protect, authorize('factorymanager','superadmin'), updateSortingBatch);
router.delete('/:id', protect, authorize('superadmin'), deleteSortingBatch);

module.exports = router;
