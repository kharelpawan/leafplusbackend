//set route for product inventory
const express = require('express');
const router = express.Router();
const productInventoryController = require('../controllers/productInventory');

// Route to get all product inventories
router.get('/', productInventoryController.getProductInventories);

// Route to get a single product inventory by ID
router.get('/:id', productInventoryController.getProductInventory);

module.exports = router;