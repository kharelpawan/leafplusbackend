// const WashingBatch = require('../models/WashingBatch');
// const SortingBatch = require('../models/SortingBatch');
// const { validationResult } = require('express-validator');

// exports.createWashingBatch = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     const body = { ...req.body };
//     body.operator = req.user.id;
//     body.createdBy = req.user.id;

//     // validate sourceSortingBatch
//     const sorting = await SortingBatch.findById(body.sourceSortingBatch);
//     if (!sorting) return res.status(400).json({ message: 'Invalid sourceSortingBatch ID' });

//     const washingBatch = await WashingBatch.create(body);
//     res.status(201).json(washingBatch);
//   } catch (err) {
//     next(err);
//   }
// };

// exports.getWashingBatches = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, dateFrom, dateTo } = req.query;
//     const query = {};

//     if (dateFrom || dateTo) {
//       query.date = {};
//       if (dateFrom) query.date.$gte = new Date(dateFrom);
//       if (dateTo) query.date.$lte = new Date(dateTo);
//     }

//     const total = await WashingBatch.countDocuments(query);
//     const batches = await WashingBatch.find(query)
//       .populate('operator', 'name')
//       .populate('verifiedBy', 'name')
//       .populate('sourceSortingBatch', 'batchId usableCount damagedCount')
//       .sort({ date: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json({ total, page: parseInt(page), limit: parseInt(limit), batches });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.getWashingBatch = async (req, res, next) => {
//   try {
//     const batch = await WashingBatch.findById(req.params.id)
//       .populate('operator', 'name')
//       .populate('verifiedBy', 'name')
//       .populate('sourceSortingBatch', 'batchId usableCount');
//     if (!batch) return res.status(404).json({ message: 'Washing batch not found' });
//     res.json(batch);
//   } catch (err) {
//     next(err);
//   }
// };

// exports.updateWashingBatch = async (req, res, next) => {
//   try {
//     const batch = await WashingBatch.findById(req.params.id);
//     if (!batch) return res.status(404).json({ message: 'Washing batch not found' });

//     Object.assign(batch, req.body);
//     await batch.save();
//     res.json(batch);
//   } catch (err) {
//     next(err);
//   }
// };

// exports.deleteWashingBatch = async (req, res, next) => {
//   try {
//     const batch = await WashingBatch.findByIdAndDelete(req.params.id);
//     if (!batch) return res.status(404).json({ message: 'Washing batch not found' });
//     res.json({ message: 'Washing batch deleted successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.dailyWashingReport = async (req, res, next) => {
//   try {
//     const { date } = req.query;
//     if (!date) return res.status(400).json({ message: 'date query is required' });

//     const start = new Date(date);
//     start.setHours(0, 0, 0, 0);
//     const end = new Date(date);
//     end.setHours(23, 59, 59, 999);

//     const report = await WashingBatch.aggregate([
//       { $match: { date: { $gte: start, $lte: end } } },
//       {
//         $group: {
//           _id: null,
//           totalWashed: { $sum: '$totalWashed' },
//           totalDamaged: { $sum: '$totalDamaged' },
//           totalGood: { $sum: '$goodLeaves' },
//           avgBadPercent: { $avg: '$badLeavesPercent' },
//           totalBatches: { $sum: 1 }
//         }
//       }
//     ]);

//     res.json(report[0] || {
//       totalWashed: 0,
//       totalDamaged: 0,
//       totalGood: 0,
//       avgBadPercent: 0,
//       totalBatches: 0
//     });
//   } catch (err) {
//     next(err);
//   }
// };
const WashingBatch = require('../models/WashingBatch');
//const SortingBatch = require('../models/SortingBatch');
const { validationResult } = require('express-validator');

exports.createWashingBatch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const body = { ...req.body };
    console.log(body);
    //body.operator = req.user.id;
    body.createdBy = req.user.id;

    // Validate sourceSortingBatch
    //const sorting = await SortingBatch.findById(body.sourceSortingBatch);
    //if (!sorting) return res.status(400).json({ message: 'Invalid sourceSortingBatch ID' });

    const washingBatch = await WashingBatch.create(body);
    const populated = await WashingBatch.findById(washingBatch._id)
      .populate('guns.operatingUser', 'name')
      .populate('createdBy', 'name')
      .populate('guns.gun', 'name code status'); //  populate gun info

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getWashingBatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, dateFrom, dateTo } = req.query;
    const query = {};

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const total = await WashingBatch.countDocuments(query);
    const batches = await WashingBatch.find(query)
      .populate('guns.operatingUser', 'name')
      //.populate('verifiedBy', 'name')
      //.populate('sourceSortingBatch', 'batchId usableCount damagedCount')
      .populate('guns.gun', 'name code status') // ✅ populate gun details
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      console.log(batches);
    res.json({ total, page: parseInt(page), limit: parseInt(limit), batches });
  } catch (err) {
    next(err);
  }
};

exports.getWashingBatch = async (req, res, next) => {
  try {
    const batch = await WashingBatch.findById(req.params.id)
      .populate('guns.operatingUser', 'name')
      //.populate('verifiedBy', 'name')
      //.populate('sourceSortingBatch', 'batchId usableCount damagedCount')
      .populate('guns.gun', 'name code status');

    if (!batch) return res.status(404).json({ message: 'Washing batch not found' });
    res.json(batch);
  } catch (err) {
    next(err);
  }
};

exports.updateWashingBatch = async (req, res, next) => {
  try {
    const batch = await WashingBatch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Washing batch not found' });

    Object.assign(batch, req.body);
    await batch.save();

    const updated = await WashingBatch.findById(batch._id).populate('guns.gun', 'name code status');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteWashingBatch = async (req, res, next) => {
  try {
    const batch = await WashingBatch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Washing batch not found' });
    res.json({ message: 'Washing batch deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.dailyWashingReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query is required' });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const report = await WashingBatch.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalWashed: { $sum: '$totalWashed' },
          totalDamaged: { $sum: '$totalDamaged' },
          totalGood: { $sum: '$goodLeaves' },
          avgBadPercent: { $avg: '$badLeavesPercent' },
          totalBatches: { $sum: 1 }
        }
      }
    ]);

    res.json(report[0] || {
      totalWashed: 0,
      totalDamaged: 0,
      totalGood: 0,
      avgBadPercent: 0,
      totalBatches: 0
    });
  } catch (err) {
    next(err);
  }
};
