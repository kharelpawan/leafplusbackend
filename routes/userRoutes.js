const express = require('express');
const router = express.Router();
const {getUsers, getUser, createUser, updateUser, deleteUser} = require("../controllers/userController");
const { protect, authorize } = require('../middleware/auth');
//yo way ma global vayo 
// router.use(protect);
// router.use(authorize('superadmin'));
// router.get(
//   '/',
//   protect,
//   authorize('superadmin'),
//   getUsers
// );
// router.post(
//   '/',
//   protect,
//   authorize('superadmin'),
//   createUser
// );

// router.route('/', authorize('superadmin')).get(getUsers).post(createUser);
//get and post users by only superadmin not other roles
router.route('/').get(protect, authorize('superadmin'),getUsers).post(protect, authorize('superadmin'),createUser);
router.route('/:id').get(protect, authorize('superadmin'),getUser).put(protect, authorize('superadmin'),updateUser).delete(protect, authorize('superadmin'),deleteUser);

module.exports = router;