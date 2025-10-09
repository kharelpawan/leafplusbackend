const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('name').notEmpty().withMessage('name required'),
  body('email').isEmail().withMessage('valid email required'),
  body('password').isLength({ min: 6 }).withMessage('password min 6 chars')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/me', protect, me);

module.exports = router;
