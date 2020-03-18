const {
  WellKnownJsonRes
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');
// const {
//   BasicRead,
//   BasicWrite,
// } = require('../../../../api/middleware/crud');
// const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

let txIndex = 0;
let credit = parseFloat(10000)
const stats = {
  'user_status': 0,
  'top_up_by_form': 0,
  'top_up_by_rest': 0,
  'failures': 0
}

//
// endpoint-related

// cRud/userStatus
exports.api_stats = (req, res, next) => {
  WellKnownJsonRes.okSingle(res, stats);
};

// cRud/userStatus
exports.user_status = (req, res, next) => {
  stats['user_status']++;
  WellKnownJsonRes.okSingle(res, {
    creditAmount: credit,
    energyConsumption: {
      day: 5.0,
      week: 42.5,
      month: 124.2
    }
  });
};

// Crud/topUpByForm
exports.top_up_by_form = (req, res, next) => {
  stats['top_up_by_form']++;
  if (req.body['debug-failure'] === true) {
    stats['failures']++;
    res
      .status(500)
      .set('Content-Type', 'text/plain')
      .send(`service failure: unable to complete transaction`);
    return;
  }
  const pin = req.body['pin'];
  if (pin !== '1234') {
    res
      .status(401)
      .set('Content-Type', 'text/plain')
      .send(`request failure: unauthorized operation`);
    return;
  }
  const meter = req.body['meter-serial'];
  if (meter !== 'C408') {
    res
      .status(401)
      .set('Content-Type', 'text/plain')
      .send(`request failure: unauthorized operation`);
    return;
  }
  const amount = req.body['top-up-amount'];
  if (amount <= 0) {
    res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send(`request failure: invalid amount`);
    return;
  }
  credit += parseFloat(amount);
  res
    .status(200)
    .set('Content-Type', 'text/plain')
    .send(`success: TX-${++txIndex}`);
};

// Crud/topUpByRest
exports.top_up_by_rest = (req, res, next) => {
  stats['top_up_by_rest']++;
  if (req.body['debug'] && req.body['debug']['simulateFailure'] === true) {
    stats['failures']++;
    WellKnownJsonRes.error(res, 500, ['service failure: unable to complete transaction']);
    return;
  }
  const pin = req.body['pin'];
  if (pin !== '1234') {
    WellKnownJsonRes.unauthorized(res, ['request failure: unauthorized operation'])
    return;
  }
  const meter = req.body['meterSerial'];
  if (meter !== 'C408') {
    WellKnownJsonRes.unauthorized(res, ['request failure: unauthorized operation'])
    return;
  }
  const amount = req.body['topUpAmount'];
  if (amount <= 0) {
    WellKnownJsonRes.error(res, 400, ['request failure: invalid amount']);
    return;
  }
  credit += parseFloat(amount);
  WellKnownJsonRes.okSingle(res, {
    transactionId: `TX-${++txIndex}`
  });
};
