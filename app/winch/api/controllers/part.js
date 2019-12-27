const mongoose = require('mongoose');

const Part = require('../models/part');

const {
  WellKnownJsonRes,
//   JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const { 
  BasicRead,
  BasicWrite,
} = require('../../../../api/middleware/crud');
const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Part, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnLabel
exports.autocomplete = (req, res, next) => {
  BasicRead.autocomplete(req, res, next, Part, 'label', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};


// Crud
exports.create = (req, res, next) => {
  if (!req.body._id) {
    WellKnownJsonRes.error(res, 400, 'missing \'_id\' param');
    return;
  }
  
  const part = new Part({
    _id: req.body._id,
    //
    // set/overwrite readonly fields
    // -> nothing to do
    //
    // set user fields
    category: req.body.category,
    label: req.body.label,
    hw: req.body.hw,
    doc: req.body.doc
  });

  BasicWrite.create(req, res, next, part);
};


//
// utils

// cRud/readById
exports.part_read_by_id = (partId) => {
  return new Promise((resolve, reject) => {
    Part.findById({ _id: new mongoose.Types.ObjectId(partId) }).exec()
    .then(findByIdResult => {
      if (!findByIdResult) {
        reject(new Error(`part '${partId}' does not exist`))
      }
      resolve(findByIdResult);
    })
    .catch(countError => {
      reject(countError)
    })
  });
}

// cRud/existsById
exports.part_exists_by_id = (partId) => {
  return new Promise((resolve, reject) => {
    Part.countDocuments({ _id: partId }).exec()
    .then(countResult => {
      countResult === 0
        ? reject(new Error(`part '${partId}' does not exist`))
        : resolve();
    })
    .catch(countError => {
      reject(countError)
    })
  });
}
