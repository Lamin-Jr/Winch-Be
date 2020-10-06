const mongoose = require('mongoose');

const ExchangeRateCtrl = require('../controllers/exchange-rate');

const {
  JsonObjectHelper
} = require('../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const {
  BasicRead,
  // BasicWrite,
} = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud
// exports.read_by_query = (req, res, next) => {
//   BasicRead.all(req, res, next, MeterReadingLog, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
// };

// cRud/aggregate
exports.aggregate = (req, res, next) => {
  {
    const missingParams = new Set();
    if (!req.body.filter) {
      missingParams.add('filter');
    } else {
      if (!req.body.filter['driver']) {
        missingParams.add('driver');
      }
      if (!req.body.filter['plant']) {
        missingParams.add('plant');
      }
      if (!req.body.filter['ts-from']) {
        missingParams.add('ts-from');
      }
      if (!req.body.filter['ts-to']) {
        missingParams.add('ts-to');
      }
    }
    if (missingParams.size !== 0) {
      WellKnownJsonRes.error(res, 400, [`missing required params: \'${[...missingParams].join('\', \'')}\'`]);
      return;
    }
  }

  const readingsFilter = {
  };

  readingsFilter.ts = readingsFilter.ts || {};
  readingsFilter.ts['$gt'] = new Date(req.body.filter['ts-from']);
  // FIXME trivial // readingsFilter.ts = readingsFilter.ts || {};
  readingsFilter.ts['$lte'] = new Date(req.body.filter['ts-to']);

  readingsFilter.m = req.body.filter['plant']

  if (req.body.filter['meter-serial']) {
    readingsFilter._id = new RegExp(`^.*\\|v${req.body.filter['driver'].toUpperCase()}\\|s${req.body.filter['meter-serial']}\\|`)
  }
  // const readingsMeterSerialsOrList = [];
  // req.body.filter['meter-serials'].forEach((meterSerial) => {
  //   readingsMeterSerialsOrList.push({
  //     // '_id': new RegExp(`^.*\\|v${req.body.filter['driver'].toUpperCase()}\\|s${meterSerial}\\|`)
  //     '_id': new RegExp(`^.*\\|s${meterSerial}\\|`)
  //   });
  // });
  // if (readingsMeterSerialsOrList.length) {
  //   Object.assign(readingsFilter, {
  //     '$or': readingsMeterSerialsOrList
  //   });
  // }

  // select driver db key and site
  //
  const mongooseDbConn = require('../middleware/mongoose-db-conn');
  const driverDbKey = req.body.filter['driver'];
  const schemaDriverConf = require(`../schemas/readings/meter-reading-conf`);
  const DriverConf = mongooseDbConn.driverDBConnRegistry
    .get(driverDbKey)
    .model(`DelivDriverConf`, schemaDriverConf);

  DriverConf.find({
    'plant.id': req.body.filter['plant']
  })
    .select({ '_id': 1, 'site.ccy': 1 })
    .exec()
    .then(findDriverResult => {
      if (!findDriverResult.length) {
        WellKnownJsonRes.okMulti(res);
        return;
      }

      return Promise.all([
        new Promise((resolve) => {
          resolve(findDriverResult[0]._id.split('/')[1]);
        }),
        ExchangeRateCtrl.exchange_rate_by_id(findDriverResult[0].site.ccy.concat('/USD'), { rate: 1 })
      ]);
    })
    .then(promiseAllResult => {
      if (!promiseAllResult) {
        return;
      }

      // perform actual aggregation
      //
      const driverDbSite = promiseAllResult[0];
      const exchangeRate = promiseAllResult[1][0].rate;
      const meterReadingLogSchema = require(`../../api/schemas/readings/meter-reading-log`);
      const MeterReadingOnPeriod = mongooseDbConn.driverDBConnRegistry
        .get(driverDbKey, driverDbSite)
        .model(`MeterReading${req.params.period.charAt(0).toUpperCase() + req.params.period.slice(1)}`, meterReadingLogSchema);

      let aggregation = MeterReadingOnPeriod.aggregate()
        .match(readingsFilter)
        .addFields({
          tsg: { '$add': ['$ts', -1000] }
        })
        ;

      {
        const groupByPeriod = buildReadingsGrouping(req.params.period, exchangeRate, req._q.proj)
        if (groupByPeriod) {
          aggregation = aggregation.group(groupByPeriod)
        }
      }
      aggregation = aggregation
        .sort({ ts: 1 })
        .addFields(paramsByPeriod[req.params.period].buildTsFieldValue(req.body.filter['ts-from'], req.body.filter['ts-to']))
        ;

      if (JsonObjectHelper.isNotEmpty(req._q.sort)) {
        aggregation = aggregation.sort(req._q.sort);
      }

      if (JsonObjectHelper.isNotEmpty(req._q.proj)) {
        aggregation = aggregation.project(req._q.proj);
      }

      BasicRead.aggregate(req, res, next, MeterReadingOnPeriod, aggregation, req._q.skip, req._q.limit);
    })
    .catch(aggregateError => {
      WellKnownJsonRes.error(res, 500, [`error encountered on aggregation`, aggregateError.message]);
      return;
    });
};


//
// private part

const buildReadingsAggregation = (exchangeRate) => {
  return {
    'ts': { $max: '$ts' },
    'e-sold-kwh': { $sum: '$p.e' },
    'e-sold-local-ccy': { $sum: '$ac.r' },
    'sg-local-ccy': { $sum: '$ac.sg' },
    'credit-local-ccy': { $last: '$ac.c' },
    // 'debit-local-ccy': { '$last': '$ac.d' },
    'e-sold-target-ccy': { $sum: { $multiply: ['$ac.r', exchangeRate] } },
    'sg-target-ccy': { $sum: { $multiply: ['$ac.sg', exchangeRate] } },
    'credit-target-ccy': { $last: { $multiply: ['$ac.c', exchangeRate] } },
    // 'debit-target-ccy': { '$last': { $multiply: ['$ac.d', exchangeRate] } },
    // 'i_min': { '$min': '$i.min' },
    // 'i_avg': { '$avg': '$i.avg' },
    // 'i_max': { '$max': '$i.max' },
    // 'v_min': { '$min': '$v.min' },
    // 'v_avg': { '$avg': '$v.avg' },
    // 'v_max': { '$max': '$v.max' },
    'categories': { $addToSet: '$ct' }
  };
}

const paramsByPeriod = {
  yearly: {
    buildTsFieldValue: (tsFrom, tsTo) => {
      return {
        ts: {
          from: {
            '$max': [
              { '$toDate': tsFrom },
              {
                '$dateFromParts': {
                  year: '$_id'
                }
              }
            ]
          },
          to: {
            '$min': [
              {
                '$dateFromParts': {
                  year: { '$add': ['$_id', 1] }
                }
              },
              { '$toDate': tsTo }
            ]
          }
        }
      }
    }
  },
  monthly: {
    buildTsFieldValue: (tsFrom, tsTo) => {
      return {
        ts: {
          from: {
            '$max': [
              { '$toDate': tsFrom },
              {
                '$dateFromParts': {
                  year: '$_id.y',
                  month: '$_id.m',
                }
              }
            ]
          },
          to: {
            '$min': [
              {
                '$dateFromParts': {
                  year: '$_id.y',
                  month: { '$add': ['$_id.m', 1] },
                }
              },
              { '$toDate': tsTo }
            ]
          }
        }
      }
    }
  },
  weekly: {
    buildTsFieldValue: (tsFrom, tsTo) => {
      return {
        ts: {
          from: {
            '$max': [
              { '$toDate': tsFrom },
              {
                '$dateFromParts': {
                  isoWeekYear: '$_id.y',
                  isoWeek: '$_id.w'
                }
              }
            ]
          },
          to: {
            '$min': [
              {
                '$dateFromParts': {
                  isoWeekYear: '$_id.y',
                  isoWeek: { '$add': ['$_id.w', 1] },
                }
              },
              { '$toDate': tsTo }
            ]
          }
        }
      }
    }
  },
  daily: {
    buildTsFieldValue: (tsFrom, tsTo) => {
      return {
        ts: {
          from: {
            '$dateFromParts': {
              year: '$_id.y',
              month: '$_id.m',
              day: '$_id.d',
            }
          },
          to: {
            '$dateFromParts': {
              year: '$_id.y',
              month: '$_id.m',
              day: { '$add': ['$_id.d', 1] },
            }
          }
        }
      }
    }
  },
  hourly: {
    buildTsFieldValue: (tsFrom, tsTo) => {
      return {
        ts: {
          from: {
            '$dateFromParts': {
              year: '$_id.y',
              month: '$_id.m',
              day: '$_id.d',
              hour: '$_id.h',
            }
          },
          to: {
            '$dateFromParts': {
              year: '$_id.y',
              month: '$_id.m',
              day: '$_id.d',
              hour: { '$add': ['$_id.h', 1] },
            }
          }
        }
      }
    }
  },
};

const groupingByPeriod = {
  yearly: {
    _id: { '$year': '$tsg' },
  },
  monthly: {
    _id: {
      y: { '$year': '$tsg' },
      m: { '$month': '$tsg' },
    }
  },
  weekly: {
    _id: {
      y: { '$isoWeekYear': '$tsg' },
      w: { '$isoWeek': '$tsg' },
    }
  },
  daily: {
    _id: {
      y: { '$year': '$tsg' },
      m: { '$month': '$tsg' },
      d: { '$dayOfMonth': '$tsg' },
    }
  },
  hourly: {
    _id: {
      y: { '$year': '$tsg' },
      m: { '$month': '$tsg' },
      d: { '$dayOfMonth': '$tsg' },
      h: { '$hour': '$tsg' },
    }
  },
};

const buildReadingsGrouping = (period, exchangeRate, projection) => {
  const result = {
    ...groupingByPeriod[period]
  };

  const fieldsNamesToAggregate = Object.keys(projection);
  const aggregations = buildReadingsAggregation(exchangeRate);
  const fieldsToAggregate = {};
  if (fieldsNamesToAggregate.length) {
    const negativeProjection = Object.values(projection)[0] === 0;

    if (negativeProjection) {
      Object.assign(fieldsToAggregate, aggregations);

      fieldsNamesToAggregate.forEach(field => {
        delete fieldsToAggregate[field]
      });
    } else {
      const fieldsToAdd = {};
      fieldsNamesToAggregate.forEach(field => {
        fieldsToAdd[field] = aggregations[field];
      });

      Object.assign(fieldsToAggregate, fieldsToAdd);
    }
  } else {
    Object.assign(fieldsToAggregate, aggregations);
  }

  Object.assign(result, fieldsToAggregate);

  return result;
}
