const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection
} = require('../controllers/collectionController');

const { protect, authorize } = require('../middleware/auth');

// multer config for signatures
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/signatures/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname))
});
const upload = multer({ storage });


//POST /api/collections
// allowed roles: collector (to create), managers can also create
router.post(
  '/',
  protect,
  authorize('collector','factorymanager','storemanager','superadmin','headofficeadmin'),
  upload.fields([{ name: 'collectorSignature', maxCount: 1 }, { name: 'receiverSignature', maxCount: 1 }]),
  [
    body('leafType').notEmpty().withMessage('leafType required'),
    body('netWeight').isNumeric().withMessage('netWeight numeric')
  ],
  createCollection
);

// read all (with filters)
router.get('/', protect, authorize('factorymanager','storemanager','salesmanager','headofficeadmin','superadmin','accountantmanager','headofficeaccountant'), getCollections);

router.get('/:id', protect, getCollection);
router.put('/:id', protect, updateCollection);
router.delete('/:id', protect, authorize('superadmin','headofficeadmin'), deleteCollection);

module.exports = router;
