const asyncHandler = require('express-async-handler');
const Gun = require('../models/Gun');

// @desc    Get all guns
// @route   GET /api/guns
// @access  Private
const getGuns = asyncHandler(async (req, res) => {
  const guns = await Gun.find().sort({ createdAt: -1 });
  res.status(200).json(guns);
});

// @desc    Get single gun
// @route   GET /api/guns/:id
// @access  Private
const getGun = asyncHandler(async (req, res) => {
  const gun = await Gun.findById(req.params.id);
  if (!gun) {
    res.status(404);
    throw new Error('Gun not found');
  }
  res.status(200).json(gun);
});

// @desc    Create new gun
// @route   POST /api/guns
// @access  Private
const createGun = asyncHandler(async (req, res) => {
  const { name, code, status, remarks, operator } = req.body;

  const existing = await Gun.findOne({ code });
  if (existing) {
    res.status(400);
    throw new Error('Gun with this code already exists');
  }

  const gun = await Gun.create({ name, code, status, remarks, operator });
  res.status(201).json(gun);
});

// @desc    Update gun
// @route   PUT /api/guns/:id
// @access  Private
const updateGun = asyncHandler(async (req, res) => {
  const gun = await Gun.findById(req.params.id);
  if (!gun) {
    res.status(404);
    throw new Error('Gun not found');
  }

  const updatedGun = await Gun.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedGun);
});

// @desc    Delete gun
// @route   DELETE /api/guns/:id
// @access  Private
const deleteGun = asyncHandler(async (req, res) => {
  const gun = await Gun.findById(req.params.id);
  if (!gun) {
    res.status(404);
    throw new Error('Gun not found');
  }

  await gun.deleteOne();
  res.status(200).json({ message: 'Gun removed successfully' });
});

module.exports = {
  getGuns,
  getGun,
  createGun,
  updateGun,
  deleteGun,
};
