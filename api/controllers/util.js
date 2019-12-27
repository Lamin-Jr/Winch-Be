const {
  FilterHelper
} = require('../lib/tp/mongodb');
const {
  JsonObjectHelper
} = require('../lib/util/json-util');

const {
  WellKnownJsonRes,
  JsonResWriter
} = require('../middleware/json-response-util');


// others/flat_json
exports.flat_json = (req, res, next) => {
  WellKnownJsonRes._genericDebug(res, 200, JsonObjectHelper.buildFlattenJson(req.body));
};

exports.encode_json = (req, res, next) => {
  WellKnownJsonRes.okSingle(res, {
    binaryData: JsonObjectHelper.encode(req.body)
  });
};

exports.decode_json = (req, res, next) => {
  WellKnownJsonRes.okSingle(res, JsonObjectHelper.decode(req.body.binaryData));
};
