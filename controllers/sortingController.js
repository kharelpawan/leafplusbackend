const SortingBatch = require('../models/SortingBatch');
const Collection = require('../models/Collection');
const { validationResult } = require('express-validator');

exports.createSortingBatch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const body = { ...req.body };
    //body.operator = req.user.id;
    body.verifiedBy = req.user.id;
    //console.log(body);
    const found = body.sourceCollections;
    console.log(body.sourceCollections);
    // ensure sourceCollections are valid objectIds and exist
    if (body.sourceCollections && Array.isArray(body.sourceCollections)) {
      const found = await Collection.find({ _id: { $in: body.sourceCollections } }).select('_id status');
      //console.log(found.status);
      if (found.length !== body.sourceCollections.length) {
        return res.status(400).json({ message: 'One or more sourceCollections are invalid' });
      }
    }

    // create
    const batch = await SortingBatch.create(body);
    if(found){
      await Collection.updateOne(
        {_id: found},
        {$set: {status: 'sorted'}}
      )
    }
    // OPTIONAL: mark Collections as "processed" or attach link (we already link them via sourceCollections)
    res.status(201).json(batch);
  } catch (err) {
    next(err);
  }
};

exports.getSortingBatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, dateFrom, dateTo, operator, qualityCategory } = req.query;
    const query = {};

    if (operator) query.operator = operator;
    if (qualityCategory) query.qualityCategory = qualityCategory;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const skip = (Math.max(parseInt(page, 10) - 1, 0)) * parseInt(limit, 10);
    const total = await SortingBatch.countDocuments(query);
    const items = await SortingBatch.find(query)
      .populate('operator', 'name email')
      .populate('verifiedBy', 'name')
      .populate('sourceCollections', 'collectionId netWeight leafType')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({ total, page: parseInt(page, 10), limit: parseInt(limit, 10), items });
  } catch (err) {
    next(err);
  }
};

exports.getSortingBatch = async (req, res, next) => {
  try {
    const item = await SortingBatch.findById(req.params.id)
      .populate('operator', 'name email')
      .populate('verifiedBy', 'name')
      .populate('sourceCollections', 'collectionId netWeight leafType');

    if (!item) return res.status(404).json({ message: 'Sorting batch not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateSortingBatch = async (req, res, next) => {
  try {
    const update = { ...req.body };
    const batch = await SortingBatch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Sorting batch not found' });

    // optionally check sourceCollections validity if provided
    if (update.sourceCollections && Array.isArray(update.sourceCollections)) {
      const found = await Collection.find({ _id: { $in: update.sourceCollections } }).select('_id');
      if (found.length !== update.sourceCollections.length) {
        return res.status(400).json({ message: 'One or more sourceCollections are invalid' });
      }
    }

    Object.assign(batch, update);
    await batch.save();
    res.json(batch);
  } catch (err) {
    next(err);
  }
};

exports.deleteSortingBatch = async (req, res, next) => {
  try {
    const removed = await SortingBatch.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Sorting batch not found' });
    res.json({ message: 'Sorting batch deleted' });
  } catch (err) {
    next(err);
  }
};

// Simple aggregated report endpoint: damage summary for given date range
exports.dailyDamageReport = async (req, res, next) => {
  try {
    const { date } = req.query; // expects YYYY-MM-DD or date string
    if (!date) return res.status(400).json({ message: 'date query required (YYYY-MM-DD)' });

    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);

    const agg = await SortingBatch.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalPreSorting: { $sum: '$preSortingCountC1' },
          totalPostSorting: { $sum: '$postSortingCountC2' },
          totalUsable: { $sum: '$usableCount' },
          totalDamaged: { $sum: '$damagedCount' },
          avgDamagePercent: { $avg: '$damagePercent' },
          batches: { $sum: 1 }
        }
      }
    ]);

    res.json(agg[0] || {
      totalPreSorting: 0,
      totalPostSorting: 0,
      totalUsable: 0,
      totalDamaged: 0,
      avgDamagePercent: 0,
      batches: 0
    });
  } catch (err) {
    next(err);
  }
};
