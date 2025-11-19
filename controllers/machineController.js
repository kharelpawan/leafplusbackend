const Machine = require('../models/Machine');

//  Create
exports.createMachine = async (req, res, next) => {
  try {
    const machine = await Machine.create(req.body);
    res.status(201).json(machine);
  } catch (err) {
    next(err);
  }
};

//  Get all
exports.getMachines = async (req, res, next) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    res.json(machines);
  } catch (err) {
    next(err);
  }
};

//  Get all
exports.getDiesByMachine = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const machines = await Machine.findById(req.params.id)
    const dies = machines.dies;
    res.json(dies);
  } catch (err) {
    next(err);
  }
};
//  Get single
exports.getMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    res.json(machine);
  } catch (err) {
    next(err);
  }
};

//  Update
exports.updateMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    res.json(machine);
  } catch (err) {
    next(err);
  }
};

//  Delete
exports.deleteMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    res.json({ message: 'Machine deleted successfully' });
  } catch (err) {
    next(err);
  }
};
