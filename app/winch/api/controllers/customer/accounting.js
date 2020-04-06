const {
  WellKnownJsonRes
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');

// const {
//   BasicRead,
//   BasicWrite,
// } = require('../../../../../api/middleware/crud');
// const mongooseMixins = require('../../../../../api/middleware/mongoose-mixins')

const {
  JsonObjectTypes
} = require('../../../../../api/lib/util/json-util');



//
// endpoint-related

// cRud/userStatus
exports.user_status = (req, res, next) => {
  WellKnownJsonRes.okSingle(res, {
    // TODO
    // creditAmount: credit,
    // energyConsumption: {
    //   day: 5.0,
    //   week: 42.5,
    //   month: 124.2
    // }
  });
};

// Crud/topUpByForm
exports.top_up_by_form = (req, res, next) => {
  if (req.body['debug-failure'] === true) {
    res
      .status(500)
      .set('Content-Type', 'text/plain')
      .send(`service failure: unable to complete transaction`);
    return;
  }
  const pin = req.body['pin'];
  if (!pin) {
    res
      .status(401)
      .set('Content-Type', 'text/plain')
      .send(`request failure: unauthorized operation`);
    return;
  }
  const amount = req.body['top-up-amount'];
  if (!JsonObjectTypes.isPositiveInteger(amount)) {
    res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send(`request failure: invalid amount`);
    return;
  }
  res
    .status(200)
    .set('Content-Type', 'text/plain')
    .send(`success`);
};

// Crud/topUpByRest
exports.top_up_by_rest = (req, res, next) => {
  if (req.body['debug'] && req.body['debug']['simulateFailure'] === true) {
    WellKnownJsonRes.error(res, 500, ['service failure: unable to complete transaction']);
    return;
  }
  const pin = req.body['pin'];
  if (!pin) {
    WellKnownJsonRes.unauthorized(res, ['request failure: unauthorized operation'])
    return;
  }
  const amount = req.body['topUpAmount'];
  if (!JsonObjectTypes.isPositiveInteger(amount)) {
    WellKnownJsonRes.error(res, 400, ['request failure: invalid amount']);
    return;
  }
  WellKnownJsonRes.okSingle(res, {
  });
};
