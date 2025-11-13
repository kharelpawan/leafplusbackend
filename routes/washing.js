// const express = require('express');
// const { body } = require('express-validator');
// const router = express.Router();
// const {
//   createWashingBatch,
//   getWashingBatches,
//   getWashingBatch,
//   updateWashingBatch,
//   deleteWashingBatch,
//   dailyWashingReport
// } = require('../controllers/washingController');

// const { protect, authorize } = require('../middleware/auth');

// router.post(
//   '/',
//   protect,
//   authorize('factorymanager','superadmin'),
//   [
//     body('sourceSortingBatch').notEmpty().withMessage('sourceSortingBatch is required'),
//     body('guns').isArray().withMessage('guns must be an array')
//   ],
//   createWashingBatch
// );

// router.get('/', protect, authorize('factorymanager','headofficeadmin','superadmin'), getWashingBatches);
// router.get('/report/daily', protect, authorize('factorymanager','headofficeadmin','superadmin'), dailyWashingReport);
// router.get('/:id', protect, getWashingBatch);
// router.put('/:id', protect, authorize('factorymanager','superadmin'), updateWashingBatch);
// router.delete('/:id', protect, authorize('superadmin'), deleteWashingBatch);

// module.exports = router;
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createWashingBatch,
  getWashingBatches,
  getWashingBatch,
  updateWashingBatch,
  deleteWashingBatch,
  dailyWashingReport
} = require('../controllers/washingController');

const { protect, authorize } = require('../middleware/auth');

router.post(
  '/',
  protect,
  authorize('factorymanager','superadmin'),
  [
    //body('sourceSortingBatch').notEmpty().withMessage('sourceSortingBatch is required'),
    body('guns').isArray().withMessage('guns must be an array of objects'),
  ],
  createWashingBatch
);

router.get('/', protect, authorize('factorymanager','headofficeadmin','superadmin'), getWashingBatches);
router.get('/report/daily', protect, authorize('factorymanager','headofficeadmin','superadmin'), dailyWashingReport);
router.get('/:id', protect, getWashingBatch);
router.put('/:id', protect, authorize('factorymanager','superadmin'), updateWashingBatch);
router.delete('/:id', protect, authorize('superadmin'), deleteWashingBatch);

module.exports = router;
