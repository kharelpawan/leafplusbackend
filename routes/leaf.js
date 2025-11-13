const express = require('express');
const router = express.Router();
const {getLeafs} = require("../controllers/leafController");
const { protect, authorize } = require('../middleware/auth')

router.route('/').get(getLeafs)

module.exports = router;