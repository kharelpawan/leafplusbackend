const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createMachine, getMachines, getMachine, updateMachine, deleteMachine
} = require('../controllers/machineController');

router.post('/', protect, authorize('superadmin', 'headofficeadmin'), createMachine);
router.get('/', protect, getMachines);
router.get('/:id', protect, getMachine);
router.put('/:id', protect, authorize('superadmin', 'headofficeadmin'), updateMachine);
router.delete('/:id', protect, authorize('superadmin'), deleteMachine);

module.exports = router;
