const ProductionBatch = require('../models/ProductionBatch');
const ProductInventory = require('../models/ProductInventory');
const Product = require('../models/Product');
const Machine = require('../models/Machine');
const Die = require('../models/Die');
const WashingBatch = require('../models/WashingBatch');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

exports.createProductionBatch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const body = { ...req.body };
    body.operator = req.user.id;
    body.createdBy = req.user.id;

    // validate machine
    const machine = await Machine.findById(body.machine);
    if (!machine) return res.status(400).json({ message: 'Invalid machine id' });

    // optional validate die
    if (body.die) {
      const die = await Die.findById(body.die);
      if (!die) return res.status(400).json({ message: 'Invalid die id' });
    }

    // optional validate source washing batch
    if (body.sourceWashingBatch) {
      const wash = await WashingBatch.findById(body.sourceWashingBatch);
      if (!wash) return res.status(400).json({ message: 'Invalid sourceWashingBatch id' });
    }
    // Step 2: Update product inventory
    let productInv = await ProductInventory.findOne({ product: body.product });
    if (productInv) {
      productInv.totalProduced += body.outputQuantity;
      productInv.availableQuantity += body.outputQuantity;
      productInv.lastUpdated = new Date();
      await productInv.save();
    } else {
      const product = await Product.findById(body.product);
      if (!product) return res.status(400).json({ message: 'Invalid product ID' });

      await ProductInventory.create({
        product: product._id,
        totalProduced: body.outputQuantity,
        availableQuantity: body.outputQuantity,
        unit: product.unit
      });
    }
    const batch = await ProductionBatch.create(body);

    // Optionally: update WashingBatch or Inventory to mark consumed leaves
    res.status(201).json(batch);
  } catch (err) {
    next(err);
  }
};

exports.getProductionBatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, dateFrom, dateTo, machine } = req.query;
    const query = {};
    if (machine) query.machine = machine;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const total = await ProductionBatch.countDocuments(query);
    const items = await ProductionBatch.find(query)
      .populate('machine')
      .populate('die')
      .populate('operator', 'name email')
      .populate('verifiedBy', 'name')
      .populate('sourceWashingBatch', 'batchId')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ total, page: parseInt(page), limit: parseInt(limit), items });
  } catch (err) {
    next(err);
  }
};

exports.getProductionBatch = async (req, res, next) => {
  try {
    const item = await ProductionBatch.findById(req.params.id)
      .populate('machine')
      .populate('die')
      .populate('operator', 'name')
      .populate('verifiedBy', 'name')
      .populate('sourceWashingBatch', 'batchId');
    if (!item) return res.status(404).json({ message: 'Production batch not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateProductionBatch = async (req, res, next) => {
  try {
    const batch = await ProductionBatch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Production batch not found' });

    // Merge updates
    Object.assign(batch, req.body);
    await batch.save();

    res.json(batch);
  } catch (err) {
    next(err);
  }
};

exports.deleteProductionBatch = async (req, res, next) => {
  try {
    const removed = await ProductionBatch.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Production batch not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* Reports */

// Daily Production Summary
exports.dailyProductionReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date required (YYYY-MM-DD)' });

    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);

    const agg = await ProductionBatch.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalInputLeaves: { $sum: '$inputLeaves' },
          totalGoodOutput: { $sum: '$goodOutput' },
          totalDamagedOutput: { $sum: '$damagedOutput' },
          totalOutput: { $sum: '$totalOutput' },
          avgPercentGood: { $avg: '$percentGood' },
          batches: { $sum: 1 }
        }
      }
    ]);

    res.json(agg[0] || {
      totalInputLeaves: 0, totalGoodOutput: 0, totalDamagedOutput: 0, totalOutput: 0, avgPercentGood: 0, batches: 0
    });
  } catch (err) { next(err); }
};

// Machine utilization and downtime summary for date range
exports.machineUtilizationReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, machineId } = req.query;
    const match = {};
    if (machineId) match.machine = mongoose.Types.ObjectId(machineId);
    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) match.date.$gte = new Date(dateFrom);
      if (dateTo) match.date.$lte = new Date(dateTo);
    }

    const agg = await ProductionBatch.aggregate([
      { $match: match },
      {
        $unwind: {
          path: '$downtime',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$machine',
          totalBatches: { $sum: 1 },
          totalInputLeaves: { $sum: '$inputLeaves' },
          totalGoodOutput: { $sum: '$goodOutput' },
          totalDowntimeMinutes: { $sum: { $ifNull: ['$downtime.durationMinutes', 0] } }
        }
      },
      {
        $lookup: {
          from: 'machines',
          localField: '_id',
          foreignField: '_id',
          as: 'machine'
        }
      },
      { $unwind: { path: '$machine', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          machine: { _id: '$machine._id', machineId: '$machine.machineId', name: '$machine.name' },
          totalBatches: 1,
          totalInputLeaves: 1,
          totalGoodOutput: 1,
          totalDowntimeMinutes: 1
        }
      }
    ]);

    res.json(agg);
  } catch (err) { next(err); }
};

// Downtime reasons aggregated
exports.downtimeReasonsReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const match = {};
    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) match.date.$gte = new Date(dateFrom);
      if (dateTo) match.date.$lte = new Date(dateTo);
    }

    const agg = await ProductionBatch.aggregate([
      { $match: match },
      { $unwind: { path: '$downtime', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$downtime.reason', totalOccurrences: { $sum: 1 }, totalMinutes: { $sum: '$downtime.durationMinutes' } } },
      { $sort: { totalMinutes: -1 } }
    ]);

    res.json(agg);
  } catch (err) { next(err); }
};
