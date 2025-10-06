const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDie, getDies, getDie, updateDie, deleteDie
} = require('../controllers/dieController');

router.post('/', protect, authorize('superadmin', 'headofficeadmin'), createDie);
router.get('/', protect, getDies);
router.get('/:id', protect, getDie);
router.put('/:id', protect, authorize('superadmin', 'headofficeadmin'), updateDie);
router.delete('/:id', protect, authorize('superadmin'), deleteDie);

module.exports = router;
