const express = require('express');
const router = express.Router();
const {
  getGuns,
  getGun,
  createGun,
  updateGun,
  deleteGun,
} = require('../controllers/gunController');

// Example middleware (optional)
// const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getGuns)
  .post(createGun);

router.route('/:id')
  .get(getGun)
  .put(updateGun)
  .delete(deleteGun);

module.exports = router;
