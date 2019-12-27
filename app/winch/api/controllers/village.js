const mongoose = require('mongoose');

const Village = require('../models/village');
const CountryCtrl = require('./country');

const {
  WellKnownJsonRes,
  // JsonResWriter,
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
  BasicRead.all(req, res, next, Village, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnName
exports.autocomplete = (req, res, next) => {
  BasicRead.autocomplete(req, res, next, Village, 'name', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};


// Crud
exports.create = (req, res, next) => {
  CountryCtrl.country_exists_by_id(req.body.country)
  .then(() => {
    const village = new Village({
      _id: new mongoose.Types.ObjectId(),
      //
      // set/overwrite readonly fields
      ...mongooseMixins.makeCreatorByUserData(req.userData),
      enabled: false,
      //
      // set user fields
      name: req.body.name,
      geo: req.body.geo,
      country: req.body.country
    });
  
    BasicWrite.create(req, res, next, village);
  })
  .catch(checkError => {
    WellKnownJsonRes.conflict(res);
  })
};


//
// utils

// cRud/existsById
exports.village_exists_by_id = (villageId) => {
  return new Promise((resolve, reject) => {
    Village.countDocuments({ _id: villageId }).exec()
    .then(countResult => {
      countResult === 0
        ? reject(new Error(`village '${villageId}' does not exist`))
        : resolve();
    })
    .catch(countError => {
      reject(countError)
    })
  });
}
