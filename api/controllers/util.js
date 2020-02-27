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


// others/now
exports.now = (req, res, next) => {
  WellKnownJsonRes.okMulti(res);
  // const iso = new Date().toISOString();
  // const nowSplit = iso.split('T');
  // WellKnownJsonRes.okSingle(res, { 
  //   iso: iso,
  //   localDate: nowSplit[0],
  //   localTime: nowSplit[1].slice(0, -1)
  // });
}

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
