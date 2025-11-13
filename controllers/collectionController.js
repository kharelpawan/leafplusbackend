const Collection = require('../models/Collection');
const LeafInventory = require("../models/LeafInventory");
const { validationResult } = require('express-validator');

exports.createCollection = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const body = { ...req.body };
    // files (multer) -> attach file paths
    // if (req.files) {
    //   body.signatures = body.signatures || {};
    //   if (req.files.collectorSignature && req.files.collectorSignature[0]) {
    //     body.signatures.collectorSignature = `/uploads/signatures/${req.files.collectorSignature[0].filename}`;
    //   }
    //   if (req.files.receiverSignature && req.files.receiverSignature[0]) {
    //     body.signatures.receiverSignature = `/uploads/signatures/${req.files.receiverSignature[0].filename}`;
    //   }
    // }

    // numeric normalization
    // ['grossWeight', 'netWeight', 'ratePerKg', 'transportCharges', 'countC1'].forEach(k => {
    //   if (body[k] !== undefined) body[k] = parseFloat(body[k]);
    // });
    //console.log(body);
    //body.collector = req.user.id;
    body.createdBy = req.user.id;

    const collection = await Collection.create(body);

    const totalLeaves = body.countC1 || body.grossWeight || 0; // assuming weight represents leaves collected 
    let inventory = await LeafInventory.findOne(); 
    if (!inventory) inventory = new LeafInventory(); 
    inventory.totalCollected += totalLeaves; 
    inventory.availableLeaves += totalLeaves; 
    await inventory.save();

    res.status(201).json(collection);
    
  } catch (err) {
    next(err);
  }
};

exports.getCollections = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, collector, dateFrom, dateTo, mode } = req.query;
    const query = {};
    if (collector) query.collector = collector;
    if (mode) query.modeOfCollection = mode;
    if (dateFrom || dateTo) query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);

    const skip = (Math.max(parseInt(page, 10) - 1, 0)) * parseInt(limit, 10);
    const total = await Collection.countDocuments(query);
    const items = await Collection.find(query)
      .populate('collector', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({ total, page: parseInt(page, 10), limit: parseInt(limit, 10), items });
  } catch (err) {
    next(err);
  }
};

exports.getCollection = async (req, res, next) => {
  try {
    const item = await Collection.findById(req.params.id).populate('collector', 'name email');
    if (!item) return res.status(404).json({ message: 'Collection not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// exports.updateCollection = async (req, res, next) => {
//   try {
//     // allow partial updates; if payment or weights change, model pre-save will recalc on save
//     const update = { ...req.body };
//     const item = await Collection.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: 'Collection not found' });

//     // apply updates
//     Object.assign(item, update);

//     // recalc (pre save hook triggers)
//     await item.save();
//     res.json(item);
//   } catch (err) {
//     next(err);
//   }
// };
exports.updateCollection = async (req, res, next) => {
  try {
    const collectionId = req.params.id;
    const updateData = { ...req.body };

    // find existing collection
    const existingCollection = await Collection.findById(collectionId);
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // check for leaf-related fields
    const leafFields = ['collectedLeaves', 'goodLeaves', 'badLeaves'];
    let leavesChanged = false;

    for (const field of leafFields) {
      if (updateData[field] !== undefined && updateData[field] !== existingCollection[field]) {
        leavesChanged = true;
        break;
      }
    }

    // apply updates
    Object.assign(existingCollection, updateData);

    // save updated collection (pre-save hooks will handle recalculations)
    const updatedCollection = await existingCollection.save();

    // record leaf changes if any
    if (leavesChanged) {
      await LeafHistory.create({
        collectionId: updatedCollection._id,
        date: new Date(),
        goodLeaves: updatedCollection.goodLeaves,
        badLeaves: updatedCollection.badLeaves,
        totalLeaves: updatedCollection.collectedLeaves,
      });
    }

    res.json(updatedCollection);
  } catch (err) {
    next(err);
  }
};

exports.deleteCollection = async (req, res, next) => {
  try {
    const removed = await Collection.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Collection not found' });

    const totalLeaves = removed.countc1 || removed.grossWeight || 0;
const inventory = await LeafInventory.findOne();
if (inventory) {
inventory.totalCollected -= totalLeaves;
inventory.availableLeaves -= totalLeaves;
if (inventory.totalCollected < 0) inventory.totalCollected = 0;
if (inventory.availableLeaves < 0) inventory.availableLeaves = 0;
await inventory.save();
}

    res.json({ message: 'Deleted successfully and inventory adjusted successfully' });
  } catch (err) {
    next(err);
  }
};
