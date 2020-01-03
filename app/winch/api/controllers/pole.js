const mongoose = require('mongoose');

const Pole = require('../models/pole');

// const {
  // WellKnownJsonRes,
  // JsonResWriter,
// } = require('../../../../api/middleware/json-response-util');
const { 
  BasicRead,
  BasicWrite,
} = require('../../../../api/middleware/crud');
const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Pole, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnCode
exports.autocomplete = (req, res, next) => {
  BasicRead.autocomplete(req, res, next, Pole, 'code', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// Crud
exports.create = (req, res, next) => {
    const pole = new Pole({
      _id: new mongoose.Types.ObjectId(),
      //
      // set/overwrite readonly fields
      ...mongooseMixins.makeCreatorByUserData(req.userData),
      enabled: false,
      //
      // set user fields
      code: req.body.code,
      geo: req.body.geo,
    });
  
    BasicWrite.create(req, res, next, pole); 
};
