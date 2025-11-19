//import SalesBatch from '../models/SalesBatch.js';

const SalesBatch = require('../models/SalesBatch.js');
//const SortingBatch = require('../models/SortingBatch');
const { validationResult } = require('express-validator');

exports.createSalesBatch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const body = { ...req.body };
    console.log(body);
    //body.operator = req.user.id;
    body.verifiedBy = req.user.id;

    const salesBatch = await SalesBatch.create(body);
    // const populated = await SalesBatch.findById(SalesBatch._id)
    //   //.populate('operator', 'name')
    //   .populate('guns.gun', 'name code status operatingUser'); //  populate gun info

    res.status(201).json(salesBatch);
  } catch (err) {
    next(err);
  }
};

exports.getSalesBatch = async (req, res, next)=>{
  try{const { page = 1, limit = 20, dateFrom, dateTo } = req.query;
    const query = {};

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    const total = await SalesBatch.countDocuments(query);
    const batches = await SalesBatch.find(query)
          .populate('soldBy', 'name')
          .populate('verifiedBy', 'name')

          .sort({ date: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
    
        res.json({ total, page: parseInt(page), limit: parseInt(limit), batches });
        } catch (err) {
    next(err);
  }
}







