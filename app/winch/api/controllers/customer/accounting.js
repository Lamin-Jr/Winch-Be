const bcrypt = require('bcrypt');

const TransactionUser = require('../../models/transaction-user');
const PlantDriver = require('../../models/plant-driver');
const CustomerConsumption = require('../../models/customer-consumption');

const spmClient = require('../../clients/spm');

const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');
// const {
//   BasicRead,
//   BasicWrite,
// } = require('../../../../../api/middleware/crud');
const mongooseMixins = require('../../../../../api/middleware/mongoose-mixins');

const { JsonObjectTypes } = require('../../../../../api/lib/util/json-util');

//
// endpoint-related

// cRud/userStatus
exports.user_status = (req, res, next) => {
  if (req.query['debug_simulateFailure'] === 'true') {
    WellKnownJsonRes.error(res, 500, [ 'service failure: unable to read user status', ]);
    return;
  }

  if (missingInputParams(['m', 'ms', 'cid', 'p'], req.query, res)) {
    return;
  }

  TransactionUser.findOne({
    '_id.m' : req.query['m'],
    '_id.ms' : req.query['ms'],
    '_id.cid' : req.query['cid'],
  }).exec()
    .then(readResult => new Promise((resolve, reject) => {
      if (!readResult) {
        WellKnownJsonRes.unauthorized(res, ['invalid customer']);
        reject(new Error('Unauthorized'));
        return;
      }
      resolve(Promise.all([
        new Promise(resolve => resolve(readResult)),
        bcrypt.compare(req.query['p'], readResult['pin']),
      ]));
    })) 
    .then(promiseAllResult => new Promise((resolve, reject) => {
      if (promiseAllResult[1] === false) {
        WellKnownJsonRes.unauthorized(res, ['unauthorized operation']);
        reject(new Error('Unauthorized'));
        return;
      }
      resolve(Promise.all([
        new Promise(resolve => resolve(promiseAllResult[0])), 
        spmClient.customers({
          key: promiseAllResult[0]._id.mRef,
          config: {
            params: {
              meter_serial: promiseAllResult[0].msRef,
              customers_only: true,
            }
          },
        }),
        CustomerConsumption.findOne({ 
          _id: promiseAllResult[0].cidRef
        }, {
          'e-sold-kwh-daily-avg': 1,
          'e-sold-kwh-monthly-avg': 1,
        }).exec()
      ]));
    }))
    .then(promiseAllResult => new Promise((resolve, reject) => {
      if (promiseAllResult[1].status !== 'success') {
        reject(new Error(`Client response error -> ${promiseAllResult[1].error}`));
        return;
      }
      if (!promiseAllResult[2]) {
        reject(new Error('Client response error -> unavailable average consumptions'));
        return;
      }
      const customer = promiseAllResult[1].customers[0];
      const meter = customer.meters[0];
      
      resolve({
        ccy: spmClient.getFromMeta({ key: promiseAllResult[0]._id.mRef }, 'ccy'),
        creditAmount: customer.credit_balance - customer.debt_balance,
        residualBundle: meter.is_running_plan
          ? parseFloat(meter.plan_balance)
          : 0.0,
        energyConsumption: {
          lastReading: meter.last_energy_datetime,
          unit: 'kWh',
          current: meter.last_energy,
          dailyAvg: promiseAllResult[2]['e-sold-kwh-daily-avg'],
          monthlyAvg: promiseAllResult[2]['e-sold-kwh-monthly-avg'],
        }
      });
    }))
    .then(jsonBody => WellKnownJsonRes.okSingle(res, jsonBody))
    .catch(readError => {
      if (!readError.message || readError.message !== 'Unauthorized') {
        WellKnownJsonRes.error(res, 500, [ 'service failure: unable to read user status', ]);
      }
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

  if (missingInputParams(['m', 'ms', 'cid', 'p', 'a'], req.body, res, (res, missingParamsMessage) => res.status(400).set('Content-Type', 'text/plain').send(missingParamsMessage))) {
    return;
  }

  if (isNaN(req.body['a']) || req.body['a'] <= 0.0) {
    res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send(`request failure: invalid amount`);
    return;
  }

  TransactionUser.findOne({
    '_id.m' : req.body['m'],
    '_id.ms' : req.body['ms'],
    '_id.cid' : req.body['cid'],
  }).exec()
    .then(readResult => new Promise((resolve, reject) => {
      if (!readResult) {
        res
          .status(401)
          .set('Content-Type', 'text/plain')
          .send(`request failure: invalid customer`);
        reject(new Error('Unauthorized'));
        return;
      }
      resolve(Promise.all([
        new Promise(resolve => resolve(readResult)),
        bcrypt.compare(req.body['p'], readResult['pin']),
      ]));
    })) 
    .then(promiseAllResult => new Promise((resolve, reject) => {
      if (promiseAllResult[1] === false) {
        res
          .status(401)
          .set('Content-Type', 'text/plain')
          .send(`request failure: unauthorized operation`);
        reject(new Error('Unauthorized'));
        return;
      }
      resolve(Promise.all([
        new Promise(resolve => resolve(promiseAllResult[0])), 
        spmClient.createTransaction({
          key: promiseAllResult[0]._id.mRef,
          config: {
          },
          body: {
            customer_id: promiseAllResult[0].cidRef,
            amount: req.body['a'],
          }
        }),
      ]));
    }))
    .then(promiseAllResult => new Promise((resolve, reject) => {
      if (promiseAllResult[1].status !== 'success') {
        reject(new Error(`Client response error -> ${promiseAllResult[1].error}`));
        return;
      }
      resolve(promiseAllResult[1].transaction_id);
    }))
    .then(textBody => res.status(201).set('Content-Type', 'text/plain').send(textBody))
    .catch(readError => {
      if (!readError.message || readError.message !== 'Unauthorized') {
        res
          .status(500)
          .set('Content-Type', 'text/plain')
          .send(`service failure: unable to complete transaction`);
        }
    });
};

// Crud/topUpByRest
exports.top_up_by_rest = (req, res, next) => {
  if (req.body['debug'] && req.body['debug']['simulateFailure'] === true) {
    WellKnownJsonRes.error(res, 500, [ 'service failure: unable to complete transaction', ]);
    return;
  }

  if (missingInputParams(['m', 'ms', 'cid', 'p', 'a'], req.body, res)) {
    return;
  }

  if (isNaN(req.body['a']) || req.body['a'] <= 0.0) {
    res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send(`request failure: invalid amount`);
    return;
  }

  TransactionUser.findOne({
    '_id.m' : req.body['m'],
    '_id.ms' : req.body['ms'],
    '_id.cid' : req.body['cid'],
  }).exec()
    .then(readResult => new Promise((resolve, reject) => {
      if (!readResult) {
        WellKnownJsonRes.unauthorized(res, ['invalid customer']);
        reject(new Error('Unauthorized'));
        return;
      }
      resolve(Promise.all([
        new Promise(resolve => resolve(readResult)),
        bcrypt.compare(req.body['p'], readResult['pin']),
      ]));
    })) 
    .then(promiseAllResult => new Promise((resolve, reject) => {
      if (promiseAllResult[1] === false) {
        WellKnownJsonRes.unauthorized(res, ['unauthorized operation']);
        reject(new Error('Unauthorized'));
        return;
      }
      resolve(Promise.all([
        new Promise(resolve => resolve(promiseAllResult[0])), 
        spmClient.createTransaction({
          key: promiseAllResult[0]._id.mRef,
          config: {
          },
          body: {
            customer_id: promiseAllResult[0].cidRef,
            amount: req.body['a'],
          }
        }),
      ]));
    }))
    .then(promiseAllResult => new Promise((resolve, reject) => {
      if (promiseAllResult[1].status !== 'success') {
        reject(new Error(`Client response error -> ${promiseAllResult[1].error}`));
        return;
      }
      resolve({ 'tx-id': promiseAllResult[1].transaction_id });
    }))
    .then(jsonBody => WellKnownJsonRes.okSingle(res, jsonBody))
    .catch(readError => {
      if (!readError.message || readError.message !== 'Unauthorized') {
        WellKnownJsonRes.error(res, 500, [ 'service failure: unable to complete transaction', ]);
      }
    });
};

// Crud/subscribe
exports.subscribe = (req, res, next) => {
  if (req.body['debug'] && req.body['debug']['simulateFailure'] === true) {
    WellKnownJsonRes.error(res, 500, [ 'service failure: unable to complete subscription', ]);
    return;
  }

  if (missingInputParams(['plant', 'meter', 'customer', 'pin'], req.body, res)) {
    return;
  }

  Promise.all([
    PlantDriver.findOne({ _id: req.body.plant }).exec(),
    bcrypt.hash(req.body.pin, 10),
  ])
    .then((promiseAllResult) => {
      const txUser = new TransactionUser({
        _id: {
          m: xFormMethods[promiseAllResult[0].accounting.xform.m](req.body.plant),
          mRef: promiseAllResult[0]._id,
          ms: xFormMethods[promiseAllResult[0].accounting.xform.ms](req.body.meter),
          cid: xFormMethods[promiseAllResult[0].accounting.xform.cid](req.body.customer),
        },
        //
        // set/overwrite readonly fields
        ...mongooseMixins.makeCreatorByUserData(req.userData),
        //
        // set user fields
        msRef: req.body.meter,
        cidRef: req.body.customer,
        pin: promiseAllResult[1],
        contacts: [],
      });

      if (req.body.contacts && req.body.contacts.length) {
        txUser.contacts = req.body.contacts;
      }

      txUser
        .save()
        .then((createResult) => {
          WellKnownJsonRes.created(res);
        })
        .catch((createError) => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            WellKnownJsonRes.conflict(res);
          } else {
            WellKnownJsonRes.errorDebug(res, createError);
          }
        });
    })
    .catch((subscribeError) => {
      WellKnownJsonRes.errorDebug(res, subscribeError);
    });
};

//
// local utils

const xFormMethods = {
  demoMXform: (input) => input,
  spmMXform: (input) => {
    const split = input.split('|');
    return `${split[1]}-${split[4]}`;
  },
  spmMsXform: (input) => {
    const split = input.split('-');
    return `${split[0].slice(2)}-${split[2].slice(-4)}`;
  },
  spmCidXform: (input) =>
    `${input.split('').reduce((a, b) => { a = (a << 5) - a + b.charCodeAt(0); return a & a; }, 0)}`,
};

const missingInputParams = (requiredParams, input, res, responseProcessor = (res, missingParamsMessage) => WellKnownJsonRes.error(res, 400, [ missingParamsMessage ])) => {
  const missingParams = new Set();

  requiredParams.forEach((currParam) => {
    if (!input[currParam]) {
      missingParams.add(currParam);
    }
  });

  if (missingParams.size !== 0) {
    responseProcessor(res, `missing required params: \'${[...missingParams].join("', '")}\'`);
    return true;
  }

  return false;
};
