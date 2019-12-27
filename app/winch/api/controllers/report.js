const mongoose = require('mongoose');

const PlantGenerationLog = require('../models/plant-generation-log');
const MeterReadingLog = require('../models/meter-reading-log');

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

// cRud/generation
exports.generation = (req, res, next) => {
  WellKnownJsonRes.okMulti(res);
}

// cRud/generation
exports.delivery = (req, res, next) => {
  WellKnownJsonRes.okMulti(res);
}


//
// utils
