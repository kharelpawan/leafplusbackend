const asyncHandler = require('express-async-handler');
const Leaf = require('../models/LeafInventory');

const getLeafs = asyncHandler(async(req, res) => {
  const leaf = await Leaf.find();
  res.status(200).json(leaf);
})


module.exports = {getLeafs};