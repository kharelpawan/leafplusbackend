const express = require("express");
const router = express.Router();
const {
  createPackaging,
  getPackagingRecords,
  getPackagingRecord,
  updatePackaging,
  deletePackaging,
} = require("../controllers/packagingController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, authorize("factorymanager", "superadmin"), getPackagingRecords)
  .post(protect, authorize("factorymanager", "superadmin"), createPackaging);

router
  .route("/:id")
  .get(protect, getPackagingRecord)
  .put(protect, authorize("factorymanager", "superadmin"), updatePackaging)
  .delete(protect, authorize("superadmin"), deletePackaging);

module.exports = router;
