// const mongoose = require('mongoose');

// const Customer = require('../../models/customer2');

// const {
//   // JsonObjectTypes,
//   JsonObjectHelper,
// } = require('../../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');
// const {
//   BasicRead,
//   // BasicWrite,
// } = require('../../../../../api/middleware/crud');
// const mongooseMixins = require('../../../../../api/middleware/mongoose-mixins');


//
// endpoint-related

// cRud/list
exports.list = (req, res, next) => {
  WellKnownJsonRes.error(res, 501);
};

// cRud/detailed
exports.detailed = (req, res, next) => {
  WellKnownJsonRes.error(res, 501);
};
