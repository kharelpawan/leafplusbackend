const express = require('express');
const router = express.Router();
const {getUsers, getUser, createUser, updateUser, deleteUser} = require("../controllers/userController");
const { protect, authorize } = require('../middleware/auth');
//yo way ma global vayo 
// router.use(protect);
// router.use(authorize('superadmin'));
router.get(
  '/',
  protect,
  authorize('superadmin'),
  getUsers
);
router.post(
  '/',
  protect,
  authorize('superadmin'),
  createUser
);

//router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;