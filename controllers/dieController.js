const Die = require('../models/Die');

// 👉 Create
exports.createDie = async (req, res, next) => {
  try {
    const die = await Die.create(req.body);
    res.status(201).json(die);
  } catch (err) {
    next(err);
  }
};

// 👉 Get all
exports.getDies = async (req, res, next) => {
  try {
    const dies = await Die.find().sort({ createdAt: -1 });
    res.json(dies);
  } catch (err) {
    next(err);
  }
};

// 👉 Get single
exports.getDie = async (req, res, next) => {
  try {
    const die = await Die.findById(req.params.id);
    if (!die) return res.status(404).json({ message: 'Die not found' });
    res.json(die);
  } catch (err) {
    next(err);
  }
};

// 👉 Update
exports.updateDie = async (req, res, next) => {
  try {
    const die = await Die.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!die) return res.status(404).json({ message: 'Die not found' });
    res.json(die);
  } catch (err) {
    next(err);
  }
};

// 👉 Delete
exports.deleteDie = async (req, res, next) => {
  try {
    const die = await Die.findByIdAndDelete(req.params.id);
    if (!die) return res.status(404).json({ message: 'Die not found' });
    res.json({ message: 'Die deleted successfully' });
  } catch (err) {
    next(err);
  }
};
