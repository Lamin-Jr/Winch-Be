const mongoose = require('mongoose');

const Country = require('../models/country');

const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const { 
  BasicRead,
  BasicWrite,
} = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Country, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnDefaultName
exports.autocomplete = (req, res, next) => {
  BasicRead.autocomplete(req, res, next, Country, 'default-name', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// Crud
exports.create = (req, res, next) => {
  const country = new Country({
    _id: req.body['aplha-2-code'],
    'default-name': req.body['default-name'],
    'aplha-3-code': req.body['aplha-3-code'],
    'numeric-code': req.body['numeric-code']
  });

  BasicWrite.create(req, res, next, country);
};


//
// utils

// cRud/existsById
exports.country_exists_by_id = (countryId) => {
  return new Promise((resolve, reject) => {
    Country.countDocuments({ _id: countryId }).exec()
    .then(countResult => {
      countResult === 0
        ? reject(new Error(`country '${countryId}' does not exist`))
        : resolve();
    })
    .catch(countError => {
      reject(countError)
    })
  });
}
