const mongoose = require('mongoose');

const Meter = require('../models/meter');

// const {
  // WellKnownJsonRes,
  // JsonResWriter,
// } = require('../../../../api/middleware/-response-utjsonil');
const { 
  BasicRead,
  BasicWrite,
} = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Meter, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnDefaultName
exports.autocomplete = (req, res, next) => {
  // TODO
  // BasicRead.autocomplete(req, res, next, Meter, 'default-name', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// Crud
exports.create = (req, res, next) => {
  // TODO
  const meter = new Meter({
  });

  BasicWrite.create(req, res, next, meter);
};


//
// utils

// cRud/existsById
exports.meter_exists_by_id = (meterId) => {
  return new Promise((resolve, reject) => {
    Meter.countDocuments({ _id: meterId }).exec()
    .then(countResult => {
      countResult === 0
        ? reject(new Error(`meter '${meterId}' does not exist`))
        : resolve();
    })
    .catch(countError => {
      reject(countError)
    })
  });
}
