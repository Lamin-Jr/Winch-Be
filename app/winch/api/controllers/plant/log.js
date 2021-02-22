const mongoose = require('mongoose');

const Plant = require('../../models/plant');

const PlantCtrl = require('../../controllers/plant');

const {
  // JsonObjectTypes,
  JsonObjectHelper,
} = require('../../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');
const {
  BasicRead,
  // BasicWrite,PlantCtrl
} = require('../../../../../api/middleware/crud');
// const mongooseMixins = require('../../../../../api/middleware/mongoose-mixins');

const {
  buildPlantFiltersRepo
} = require('./_shared')


//
// endpoint-related

// cRud/eGen
exports.e_gen = (req, res, next) => {
  exports.aggregateGen(
    req.params.period,
    buildPlantFiltersRepo(req.body.filter, req.params.period === 'daily'),
    req.body.context,
    req._q)
    .then(aggregateResult => {
      WellKnownJsonRes.okMulti(res, aggregateResult.readResult.length, aggregateResult.readResult, aggregateResult.context.skip, aggregateResult.context.limit);
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });
};

// cRud/eDeliv
exports.e_deliv = (req, res, next) => {
  exports.aggregateDelivery(req.params.period, req.body.filter, req._q)
    .then(aggregationMeta => {
      if (!aggregationMeta) {
        WellKnownJsonRes.okMulti(res);
        return;
      }
      BasicRead.aggregate(req, res, next, aggregationMeta.model, aggregationMeta.aggregation, req._q.skip, req._q.limit);
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });
};

// cRud/eDelivCat
exports.e_deliv_cat = (req, res, next) => {
  exports.aggregateDeliveryByCustomerCategory(
    req.params.period,
    req.body.filter,
    req.body.context,
    req._q)
    .then(aggregationMeta => {
      if (!aggregationMeta) {
        WellKnownJsonRes.okMulti(res);
        return;
      }
      BasicRead.aggregate(req, res, next, aggregationMeta.model, aggregationMeta.aggregation, req._q.skip, req._q.limit);
    })
    .catch(readError => {
      if (readError.status) {
        WellKnownJsonRes.error(res, readError.status, [readError.message]);
      } else {
        WellKnownJsonRes.errorDebug(res, readError);
      }
    });
};

// cRud/forecast
exports.forecast = (req, res, next) => {
  exports.aggregateForecast(
    req.params.period,
    buildPlantFiltersRepo(req.body.filter, req.params.period === 'daily'),
    req.body.context,
    req._q)
    .then(aggregateResult => {
      WellKnownJsonRes.okMulti(res, aggregateResult.readResult.length, aggregateResult.readResult, aggregateResult.context.skip, aggregateResult.context.limit);
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });
};

// DEPRECATED
// cRud/aggregateForFinancial
exports.financial = (req, res, next) => {
  {
    const missingParams = new Set();
    if (!req.body.filter) {
      missingParams.add('filter');
    } else {
      if (!req.body.filter['plant']) {
        missingParams.add('plant');
      }
      if (!req.body.filter['driver']) {
        missingParams.add('driver');
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

  const finPerformanceFilter = {
  };

  finPerformanceFilter.ts = finPerformanceFilter.ts || {};
  finPerformanceFilter.ts['$gte'] = new Date(req.body.filter['ts-from']);
  finPerformanceFilter.ts = finPerformanceFilter.ts || {};
  finPerformanceFilter.ts['$lte'] = new Date(req.body.filter['ts-to']);

  finPerformanceFilter._id = new RegExp(`^${req.body.filter['plant'].replace(/\|/g, "\\|")}n\\d+\\|$`);

  // select driver db key and site
  //

  // TODO query for driver


  const mongooseDbConn = require('../../middleware/mongoose-db-conn');
  const driverDbKey = req.body.filter['driver'];
  const schemaFinancialPerformanceOnPeriod = require(`../../schemas/kpi/financial-forecast-${req.params.period}`);
  const FinancialPerformanceOnPeriod = mongooseDbConn.driverDBConnRegistry
    .get(driverDbKey)
    .model(`FinancialForecast${req.params.period.charAt(0).toUpperCase() + req.params.period.slice(1)}`, schemaFinancialPerformanceOnPeriod);

  if (JsonObjectHelper.isEmpty(req._q.sort)) {
    req._q.sort = {
      ts: 1
    }
  }

  BasicRead.all(req, res, next, FinancialPerformanceOnPeriod, finPerformanceFilter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};


//
// utils

exports.aggregateGen = (
  period = 'daily',
  filtersRepo,
  context = {},
  q = {},
) => {
  return new Promise((resolve, reject) => {
    try {
      PlantCtrl.filteredEGenDriverPlants(filtersRepo.plantsFilter, filtersRepo.plantsStatusFilter, filtersRepo.plantsLocationsFilter)
        .then(readResult => {
          if (!readResult.length) {
            resolve({
              context: {
                skip: q.skip && q.skip > 0 ? q.skip : undefined,
                limit: q.limit && q.limit > 0 ? q.limit : undefined,
              },
              readResult: [],
            });
            return;
          }

          // compose actual input filter
          readResult.forEach(driverItem => {
            driverItem.actualTargetFilter = {};
            const readingsPlantIdsOrList = [];
            driverItem.plants.forEach(plantId => {
              const plantIdTokens = plantId.split('|');
              readingsPlantIdsOrList.push({
                _id: new RegExp(`^\\|${plantIdTokens[1]}\\|${plantIdTokens[2]}\\|${plantIdTokens[3]}\\|.*`)
              });
            });
            if (filtersRepo.targetFilter.ts) {
              driverItem.actualTargetFilter.ts = filtersRepo.targetFilter.ts
            }
            if (readingsPlantIdsOrList.length) {
              driverItem.actualTargetFilter['$or'] = readingsPlantIdsOrList;
            }
          });

          // perform actual aggregation
          //
          // - step #1: create aggregation metadata by driver
          Promise.all([].concat([...readResult.map(driverItem => exports.aggregateGenByDriver(
            driverItem._id,
            period,
            driverItem.actualTargetFilter,
            context,
            q
          ))]))
            // - step #2: query for aggregation count
            .then(promiseAllResult => Promise.all([
              new Promise(resolve => resolve({
                skip: q.skip && q.skip > 0 ? q.skip : undefined,
                limit: q.limit && q.limit > 0 ? q.limit : undefined,
                aggregationMetaList: promiseAllResult,
              })),
              ...promiseAllResult.map(aggregationMeta => {
                if (!aggregationMeta || !aggregationMeta.aggregation || !aggregationMeta.model) {
                  // there is still no db connection available
                  // -> no info available
                  // -> return empty result
                  return new Promise(resolve => resolve([]));
                } else {
                  return (aggregationMeta.aggregationCount ||
                    aggregationMeta.model.aggregate(aggregationMeta.aggregation.pipeline()).count('count')).exec();
                }
              }),
            ]))
            // - step #3: query for aggregation only where count is positive
            .then(promiseAllResult => {
              const localContext = promiseAllResult.splice(0, 1)[0];
              return Promise.all([
                new Promise(resolve => resolve({
                  skip: localContext.skip,
                  limit: localContext.limit
                })),
                ...promiseAllResult.map((readCountResult, index) => {
                  if (readCountResult.length === 0 || readCountResult[0].count === 0) {
                    return new Promise(resolve => resolve([]));
                  }
                  const aggregationMeta = localContext.aggregationMetaList[index];
                  return aggregationMeta.model.aggregate(aggregationMeta.aggregation.pipeline()).exec();
                })
              ]);
            })
            // - step #4: merge all aggregation results as one
            .then(promiseAllResult => {
              const localContext = promiseAllResult.splice(0, 1)[0];
              let readResult = [].concat(...promiseAllResult);
              if (localContext.skip) {
                readResult = readResult.slice(localContext.skip);
              }
              if (localContext.limit) {
                readResult = readResult.slice(0, localContext.limit);
              }
              resolve({
                context: localContext,
                readResult,
              });
            })
            .catch(readError => reject(readError));
        })
        .catch(readError => reject(readError));
    } catch (error) {
      reject(error);
    }
  });
};

exports.aggregateGenByDriver = (
  driverDbKey,
  period = 'daily',
  filter = {},
  context = {},
  q = {},
  applyPagination = false,
) => {
  return new Promise((resolve, reject) => {
    try {
      const dbConn = require('../../middleware/mongoose-db-conn').driverDBConnRegistry.get(driverDbKey);
      if (!dbConn) {
        resolve(undefined)
      }
      const schema = require(`../../../api/schemas/readings/gen-reading-${period}-log`);
      const GenReadingPeriodModel = dbConn.model(`GenReading${period.charAt(0).toUpperCase() + period.slice(1)}`, schema);
      const isDailyPeriod = period === 'daily';

      let aggregation = GenReadingPeriodModel.aggregate()
        .match(filter);

      if (context.aggregator === 'plants') {
        aggregation = aggregation.addFields(buildGenPlantIdAddFieldStage());
      }

      aggregation = aggregation
        .group(buildGenGrouping(period, context))
        .sort(JsonObjectHelper.isNotEmpty(q.sort)
          ? q.sort
          : isDailyPeriod
            ? { ts: 1 }
            : { tsf: 1 })
        //
        ;

      if (JsonObjectHelper.isNotEmpty(q.proj)) {
        aggregation = aggregation.project(q.proj);
      }

      const aggregationMeta = {
        model: GenReadingPeriodModel,
      };

      if (applyPagination) {
        if (q.skip && q.skip > 0) {
          aggregation = aggregation.skip(q.skip);
          aggregationMeta.context = aggregationMeta.context || {};
          aggregationMeta.context.skip = q.skip;
        }
        if (q.limit && q.limit > 0) {
          aggregation = aggregation.limit(q.limit);
          aggregationMeta.context = aggregationMeta.context || {};
          aggregationMeta.context.limit = q.limit;
        }
      }

      aggregationMeta.aggregation = aggregation;

      resolve(aggregationMeta);
    } catch (error) {
      reject(error);
    }
  });
};

exports.aggregateDelivery = (
  period = 'daily',
  filter = {},
  q = { sort: { _id: 1 } },
) => {
  return new Promise((resolve, reject) => {
    try {
      const isDailyPeriod = period === 'daily';
      const filtersRepo = buildPlantFiltersRepo(filter, isDailyPeriod)

      PlantCtrl.filteredPlantIds(filtersRepo.plantsFilter, filtersRepo.plantsStatusFilter, filtersRepo.plantsLocationsFilter)
        .then(readResult => {
          if (!readResult.length) {
            resolve();
            return;
          }
          const readingsPlantIdsOrList = [];
          readResult.map(itemBody => itemBody._id).forEach((plantId) => {
            const plantIdTokens = plantId.split('|');
            readingsPlantIdsOrList.push({
              _id: new RegExp(`^\\|${plantIdTokens[1]}\\|${plantIdTokens[2]}\\|${plantIdTokens[3]}\\|.*`)
            });
          });

          if (readingsPlantIdsOrList.length) {
            Object.assign(filtersRepo.targetFilter, {
              '$or': readingsPlantIdsOrList
            });
          }

          // perform actual aggregation
          //
          const schema = require(`../../../api/schemas/readings/meter-reading-${period}-log`);
          const MeterReadingPeriodModel = require('../../middleware/mongoose-db-conn').driverDBConnRegistry
            .get('spm')
            .model(`MeterReading${period.charAt(0).toUpperCase() + period.slice(1)}`, schema);
          let aggregation = MeterReadingPeriodModel.aggregate()
            .match(filtersRepo.targetFilter)
            .group(isDailyPeriod
              ? {
                _id: '$d',
                'ts': { $first: '$ts' },
                'e-sold-kwh': { $sum: '$e-sold-kwh' },
                'e-sold-target-ccy': { $sum: '$e-sold-target-ccy' },
                'sg-target-ccy': { $sum: '$sg-target-ccy' },
                'total-conn': { $sum: '$total-conn' },
                'av-perc': { $avg: '$av-perc' },
                'tx-e-local-ccy': { $sum: '$tx-e-local-ccy' },
                'tx-e-target-ccy': { $sum: '$tx-e-target-ccy' },
                'total-tx': { $sum: '$total-tx' },
              }
              : {
                _id: {
                  b: '$d',
                  e: '$dt',
                },
                'tsf': { $first: '$ts' },
                'tst': { $first: '$tst' },
                'e-sold-kwh': { $sum: '$e-sold-kwh' },
                'e-sold-target-ccy': { $sum: '$e-sold-target-ccy' },
                'sg-target-ccy': { $sum: '$sg-target-ccy' },
                'total-conn': { $sum: '$total-conn' },
                'av-perc': { $avg: '$av-perc' },
                'tx-e-local-ccy': { $sum: '$tx-e-local-ccy' },
                'tx-e-target-ccy': { $sum: '$tx-e-target-ccy' },
                'total-tx': { $sum: '$total-tx' },
              })
            .sort(JsonObjectHelper.isNotEmpty(q.sort)
              ? q.sort
              : isDailyPeriod
                ? { ts: 1 }
                : { tsf: 1 })
            //
            ;

          if (JsonObjectHelper.isNotEmpty(q.proj)) {
            aggregation = aggregation.project(q.proj);
          }

          resolve({
            model: MeterReadingPeriodModel,
            aggregation
          })
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

exports.aggregateDeliveryByCustomerCategory = (
  period = 'daily',
  filter = {},
  context = {
    aggregator: undefined,
    'exchange-rate': undefined,
    'show-pods': false
  },
  q = { sort: { _id: 1 } },
) => {
  return new Promise((resolve, reject) => {
    try {
      const deliveryGrouping = buildDeliveryGrouping(period, context);
      if (!deliveryGrouping) {
        const error = new Error(`unsupported aggregator: \'${context.aggregator}\'`);
        error.status = 400;
        reject(error);
        return;
      }

      const isDailyPeriod = period === 'daily';
      const filtersRepo = buildPlantFiltersRepo(filter, isDailyPeriod)

      let aggregation = Plant.aggregate()
        .match(filtersRepo.plantsFilter)
        //
        ;

      if (filtersRepo.plantsStatusFilter) {
        aggregation = aggregation
          .lookup({
            from: 'plants-status',
            localField: '_id',
            foreignField: '_id',
            as: 'monitor'
          })
          .unwind('$monitor')
          .match(filtersRepo.plantsStatusFilter)
          //
          ;
      }

      if (filtersRepo.plantsLocationsFilter) {
        aggregation = aggregation
          .lookup({
            from: 'villages',
            localField: 'village',
            foreignField: '_id',
            as: 'village'
          })
          .unwind('$village')
          .match(filtersRepo.plantsLocationsFilter)
          //
          ;
      }
      aggregation = aggregation
        .lookup({
          from: 'plants-drivers',
          localField: '_id',
          foreignField: '_id',
          as: 'driver'
        })
        .unwind('$driver')
        .group({
          _id: '$driver.e-deliv',
          plants: { $addToSet: '$_id' }
        })
        //
        ;

      aggregation = aggregation.allowDiskUse(true);

      aggregation.exec()
        .then(readResult => {
          if (!readResult.length) {
            resolve();
            return;
          } else if (readResult.length !== 1) {
            const error = new Error(`unable to query more than one driver at once:`);
            error.status = 501;
            reject(error)
            return;
          }

          // perform actual aggregation
          //
          const schema = require(`../../../api/schemas/readings/customer-${period}-log`);
          const CustomerPeriodModel = require('../../middleware/mongoose-db-conn').driverDBConnRegistry
            .get(readResult[0]._id)
            .model(`Customer${period.charAt(0).toUpperCase() + period.slice(1)}`, schema);
          aggregation = CustomerPeriodModel.aggregate()
            .match({
              ...filtersRepo.targetFilter,
              '_id.m': readResult[0].plants == 1
                ? readResult[0].plants[0]
                : { $in: readResult[0].plants }
            })
            .group(deliveryGrouping)
            .sort(JsonObjectHelper.isNotEmpty(q.sort)
              ? q.sort
              : isDailyPeriod
                ? { ts: 1 }
                : { tsf: 1 })
            //
            ;

          if (JsonObjectHelper.isNotEmpty(q.proj)) {
            aggregation = aggregation.project(q.proj);
          }

          resolve({
            model: CustomerPeriodModel,
            aggregation
          });
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

exports.aggregateForecast = (
  period = 'daily',
  filtersRepo,
  context = {},
  q = {},
) => {
  return new Promise((resolve, reject) => {
    try {
      PlantCtrl.filteredEDelivDriverPlants(filtersRepo.plantsFilter, filtersRepo.plantsStatusFilter, filtersRepo.plantsLocationsFilter)
        .then(readResult => {
          if (!readResult.length) {
            resolve({
              context: {
                skip: q.skip && q.skip > 0 ? q.skip : undefined,
                limit: q.limit && q.limit > 0 ? q.limit : undefined,
              },
              readResult: [],
            });
            return;
          }

          // perform actual aggregation
          //
          // - step #1: create aggregation metadata by driver
          Promise.all([].concat([...readResult.map(driverItem => exports.aggregateForecastByDriver(
            driverItem._id,
            period,
            {
              '_id.m': { '$in': driverItem.plants },
              ts: filtersRepo.targetFilter.ts,
            },
            context,
            q
          ))]))
            // - step #2: query for aggregation count
            .then(promiseAllResult => Promise.all([
              new Promise(resolve => resolve({
                skip: q.skip && q.skip > 0 ? q.skip : undefined,
                limit: q.limit && q.limit > 0 ? q.limit : undefined,
                aggregationMetaList: promiseAllResult,
              })),
              ...promiseAllResult.map(aggregationMeta => {
                if (!aggregationMeta || !aggregationMeta.aggregation || !aggregationMeta.model) {
                  // this is a bug
                  return new Promise((resolve, reject) => reject('invalid aggregation meta'));
                } else {
                  return (aggregationMeta.aggregationCount ||
                    aggregationMeta.model.aggregate(aggregationMeta.aggregation.pipeline()).count('count')).exec();
                }
              }),
            ]))
            // - step #3: query for aggregation only where count is positive
            .then(promiseAllResult => {
              const localContext = promiseAllResult.splice(0, 1)[0];
              return Promise.all([
                new Promise(resolve => resolve({
                  skip: localContext.skip,
                  limit: localContext.limit
                })),
                ...promiseAllResult.map((readCountResult, index) => {
                  if (readCountResult.length === 0 || readCountResult[0].count === 0) {
                    return new Promise(resolve => resolve([]));
                  }
                  const aggregationMeta = localContext.aggregationMetaList[index];
                  return aggregationMeta.model.aggregate(aggregationMeta.aggregation.pipeline()).exec();
                })
              ]);
            })
            // - step #4: merge all aggregation results as one
            .then(promiseAllResult => {
              const localContext = promiseAllResult.splice(0, 1)[0];
              let readResult = [].concat(...promiseAllResult);
              if (localContext.skip) {
                readResult = readResult.slice(localContext.skip);
              }
              if (localContext.limit) {
                readResult = readResult.slice(0, localContext.limit);
              }
              resolve({
                context: localContext,
                readResult,
              });
            })
            .catch(readError => reject(readError));
        })
        .catch(readError => reject(readError));
    } catch (error) {
      reject(error);
    }
  });
};

exports.aggregateForecastByDriver = (
  driverDbKey,
  period = 'daily',
  filter = {},
  context = {
    'exchange-rate': undefined,
  },
  q = {},
  applyPagination = false,
) => {
  return new Promise((resolve, reject) => {
    try {
      const mongooseDbConn = require('../../middleware/mongoose-db-conn');
      const schema = require(`../../schemas/kpi/forecast-${period}`);
      const ForecastPeriodModel = mongooseDbConn.driverDBConnRegistry
        .get(driverDbKey)
        .model(`Forecast${period.charAt(0).toUpperCase() + period.slice(1)}`, schema);

      const isDailyPeriod = period === 'daily';

      let aggregation = ForecastPeriodModel.aggregate()
        .match(filter)
        .group(buildForecastGrouping(period, context))
        .sort(JsonObjectHelper.isNotEmpty(q.sort)
          ? q.sort
          : isDailyPeriod
            ? { ts: 1 }
            : { tsf: 1 })

      if (JsonObjectHelper.isNotEmpty(q.proj)) {
        aggregation = aggregation.project(q.proj);
      }

      const aggregationMeta = {
        model: ForecastPeriodModel,
      };

      if (applyPagination) {
        if (q.skip && q.skip > 0) {
          aggregation = aggregation.skip(q.skip);
          aggregationMeta.context = aggregationMeta.context || {};
          aggregationMeta.context.skip = q.skip;
        }
        if (q.limit && q.limit > 0) {
          aggregation = aggregation.limit(q.limit);
          aggregationMeta.context = aggregationMeta.context || {};
          aggregationMeta.context.limit = q.limit;
        }
      }

      aggregationMeta.aggregation = aggregation;

      resolve(aggregationMeta);
    } catch (error) {
      reject(error);
    }
  });
};

//
// private part

//   - grouping

const buildDefaultDailyGroupId = () => {
  return '$d';
};

const buildDefaultRangedGroupId = () => {
  return {
    b: '$d',
    e: '$dt',
  }
};

//   - grouping / gen

const buildGenGrouping = (period, context) => {
  const aggregatorStrategy = genGroupingStrategy[context.aggregator || 'default'];
  try {
    return {
      _id: aggregatorStrategy.groupId[period](),
      ...aggregatorStrategy.accumulators[period](context),
    };
  } catch {
    return undefined;
  }
};

const buildGenSharedAccumulators = () => {
  return {
    'batt-t-in': { '$avg': '$batt-t-in' },
    'e-theoretical': { '$sum': '$e-theoretical' },
    'e-delivered': { '$sum': '$e-delivered' },
    'e-self-cons': { '$sum': '$e-self-cons' },
    'sens-irrad': { '$avg': '$sens-irrad' },
    'sens-t-in': { '$avg': '$sens-t-in' },
    'sens-t-mod': { '$avg': '$sens-t-mod' },
    'sens-t-out': { '$avg': '$sens-t-out' },
  };
};

const buildGenDailyAccumulators = () => {
  const result = {
    'ts': { $first: '$ts' },
    ...buildGenSharedAccumulators()
  };
  return result;
};

const buildGenRangedAccumulators = () => {
  const result = {
    'tsf': { $first: '$ts' },
    'tst': { $first: '$tst' },
    ...buildGenSharedAccumulators()
  };
  return result;
};

const buildGenPlantIdAddFieldStage = () => {
  return {
    m: {
      $regexFind: {
        input: '$_id',
        regex: /.+(?=n\d+\|)/
      },
    },
  };
};

const buildGenGroupByPlantsIdPart = () => {
  return { m: '$m.match' };
};

const buildGenRangedGroupByPlantsId = () => {
  return {
    ...buildDefaultRangedGroupId(),
    ...buildGenGroupByPlantsIdPart(),
  }
}

const genGroupingStrategy = {
  default: {
    groupId: {
      daily: buildDefaultDailyGroupId,
      weekly: buildDefaultRangedGroupId,
      monthly: buildDefaultRangedGroupId,
      yearly: buildDefaultRangedGroupId,
    },
    accumulators: {
      daily: (context) => buildGenDailyAccumulators(context),
      weekly: (context) => buildGenRangedAccumulators(context),
      monthly: (context) => buildGenRangedAccumulators(context),
      yearly: (context) => buildGenRangedAccumulators(context),
    },
  },
  plants: {
    groupId: {
      daily: () => {
        return {
          d: buildDefaultDailyGroupId(),
          ...buildGenGroupByPlantsIdPart(),
        };
      },
      weekly: buildGenRangedGroupByPlantsId,
      monthly: buildGenRangedGroupByPlantsId,
      yearly: buildGenRangedGroupByPlantsId,
    },
    accumulators: {
      daily: (context) => buildGenDailyAccumulators(context),
      weekly: (context) => buildGenRangedAccumulators(context),
      monthly: (context) => buildGenRangedAccumulators(context),
      yearly: (context) => buildGenRangedAccumulators(context),
    },
  },
};

//   - grouping / delivery

const buildDeliveryGrouping = (period, context) => {
  const aggregatorStrategy = deliveryGroupingStrategy[context.aggregator || 'default'];
  try {
    return {
      _id: aggregatorStrategy.groupId[period](),
      ...aggregatorStrategy.accumulators[period](context),
    };
  } catch {
    return undefined;
  }
};

const buildDeliverySharedAccumulators = (context) => {
  return {
    'av': { $avg: { $divide: ['$avc', context.daysInPeriod * 96.0] } },
    'b-lccy': { $avg: '$b-lccy' },
    'cc': { $sum: 1 },
    'ct': { $addToSet: '$ct' },
    ... (context['show-pods'] === true
      ? { 'pod': { $addToSet: '$pod' } }
      : {}
    ),
    'ep': { $sum: '$ep' },
    'es': { $sum: '$es' },
    'r-es-lccy': { $sum: '$r-es-lccy' },
    'r-sc-lccy': { $sum: '$r-sc-lccy' },
    'tx-es-c': { $sum: '$tx-es-c' },
    'tx-es-lccy': { $sum: '$tx-es-lccy' },
  };
};

const buildDeliveryDailyAccumulators = (context) => {
  const result = {
    'ts': { $first: '$ts' },
    ...buildDeliverySharedAccumulators({ ...context, daysInPeriod: 1 }),
  };
  applyDeliveryExchangeRate(result, context['exchange-rate'] || '$tccy-er')
  return result;
};

const buildDeliveryRangedAccumulators = (context) => {
  const result = {
    'tsf': { $first: '$ts' },
    'tsfa': { $min: '$tsf' },
    'tst': { $first: '$tst' },
    ...buildDeliverySharedAccumulators(context),
  };
  applyDeliveryExchangeRate(result, context['exchange-rate'] || '$tccy-er')
  return result;
};

const applyDeliveryExchangeRate = (target, customExchangeRate) => {
  // if a custom exchange rate is passed, let's overwrite involved accumulator
  target['b-tccy'] = { $avg: { $multiply: ['$b-lccy', customExchangeRate] } };
  target['r-es-tccy'] = { $sum: { $multiply: ['$r-es-lccy', customExchangeRate] } };
  target['r-sc-tccy'] = { $sum: { $multiply: ['$r-sc-lccy', customExchangeRate] } };
  target['tx-es-tccy'] = { $sum: { $multiply: ['$tx-es-lccy', customExchangeRate] } };
  if (customExchangeRate === '$tccy-er') {
    target['avg-tccy-er'] = { $avg: customExchangeRate };
  }
}

// BEGIN GROUP: By categories
const buildDeliveryRangedGroupByCategoriesId = () => {
  return {
    ...buildDefaultRangedGroupId(),
    ct: "$ct",
  }
}

const buildDeliveryRangedAccumulatorsByCategories = (context) => {
  const result = buildDeliveryRangedAccumulators(context);
  delete result.ct;
  return result;
}
// END GROUP: By categories

// BEGIN GROUP: By pods
const buildDeliveryRangedGroupByPodsId = () => {
  return {
    ...buildDefaultRangedGroupId(),
    pod: "$pod",
  }
}

const buildDeliveryRangedAccumulatorsByPods = (context) => {
  const result = buildDeliveryRangedAccumulators(context);
  delete result.pod;
  return result;
}
// END GROUP: By pods

const deliveryGroupingStrategy = {
  default: {
    groupId: {
      daily: buildDefaultDailyGroupId,
      weekly: buildDefaultRangedGroupId,
      monthly: buildDefaultRangedGroupId,
      yearly: buildDefaultRangedGroupId,
    },
    accumulators: {
      daily: (context) => buildDeliveryDailyAccumulators(context),
      weekly: (context) => buildDeliveryRangedAccumulators({ ...context, daysInPeriod: 7, }),
      monthly: (context) => buildDeliveryRangedAccumulators({ ...context, daysInPeriod: 30.4375, }),
      yearly: (context) => buildDeliveryRangedAccumulators({ ...context, daysInPeriod: 365.25, }),
    }
  },
  categories: {
    groupId: {
      daily: () => {
        return {
          d: buildDefaultDailyGroupId(),
          ct: "$ct",
        };
      },
      weekly: buildDeliveryRangedGroupByCategoriesId,
      monthly: buildDeliveryRangedGroupByCategoriesId,
      yearly: buildDeliveryRangedGroupByCategoriesId,
    },
    accumulators: {
      daily: (context) => {
        const result = buildDeliveryDailyAccumulators(context);
        delete result.ct;
        return result;
      },
      weekly: (context) => buildDeliveryRangedAccumulatorsByCategories({ ...context, daysInPeriod: 7, }),
      monthly: (context) => buildDeliveryRangedAccumulatorsByCategories({ ...context, daysInPeriod: 30.4375, }),
      yearly: (context) => buildDeliveryRangedAccumulatorsByCategories({ ...context, daysInPeriod: 365.25, }),
    }
  },
  customers: {
    groupId: {
      daily: () => {
        return {
          d: buildDefaultDailyGroupId(),
          pod: "$pod",
        };
      },
      weekly: buildDeliveryRangedGroupByPodsId,
      monthly: buildDeliveryRangedGroupByPodsId,
      yearly: buildDeliveryRangedGroupByPodsId,
    },
    accumulators: {
      daily: (context) => {
        const result = buildDeliveryDailyAccumulators(context);
        delete result.pod;
        return result;
      },
      weekly: (context) => buildDeliveryRangedAccumulatorsByPods({ ...context, daysInPeriod: 7, }),
      monthly: (context) => buildDeliveryRangedAccumulatorsByPods({ ...context, daysInPeriod: 30.4375, }),
      yearly: (context) => buildDeliveryRangedAccumulatorsByPods({ ...context, daysInPeriod: 365.25, }),
    }
  },
};

//   - grouping / forecast

const buildForecastGrouping = (period, context) => {
  // at moment aggregator is not supported
  // hence 'default' will always be selected
  const aggregatorStrategy = forecastGroupingStrategy[context.aggregator || 'default'];
  try {
    return {
      _id: aggregatorStrategy.groupId[period](),
      ...aggregatorStrategy.accumulators[period](context),
    };
  } catch {
    return undefined;
  }
};

const getForecastBasicAccumulators = () => {
  return {
    'cnt': { $sum: 1 },
    'eafs': { $sum: '$eafs' },
    'es-fcst': { $sum: '$es-fcst' },
    'es-fcst-cum': { $sum: '$es-fcst-cum' },
    'es-real': { $sum: '$es-real' },
    'es-real-cum': { $sum: '$es-real-cum' },
    'fm-fcst-lccy': { $sum: '$fm-fcst-lccy' },
    'fm-fcst-cum-lccy': { $sum: '$fm-fcst-cum-lccy' },
    'fm-real-lccy': { $sum: '$fm-real-lccy' },
    'fm-real-cum-lccy': { $sum: '$fm-real-cum-lccy' },
    'ramp-up-avg-fctr': { $avg: '$ramp-up-fctr' },
  }
}

const buildForecastDailyAccumulators = (context) => {
  const result = {
    'ts': { $first: '$ts' },
    ...getForecastBasicAccumulators(),
  };
  applyForecastExchangeRate(result, context['exchange-rate'] || '$tccy-er')
  return result;
};

const buildForecastRangedAccumulators = (context) => {
  const result = {
    'tsf': { $first: '$ts' },
    'tst': { $first: '$tst' },
    ...getForecastBasicAccumulators(),
  };
  applyForecastExchangeRate(result, context['exchange-rate'] || '$tccy-er')
  return result;
};

const applyForecastExchangeRate = (target, customExchangeRate) => {
  target['fm-fcst-tccy'] = { $sum: { $multiply: ['$fm-fcst-lccy', customExchangeRate] } };
  target['fm-fcst-cum-tccy'] = { $sum: { $multiply: ['$fm-fcst-cum-lccy', customExchangeRate] } };
  target['fm-real-tccy'] = { $sum: { $multiply: ['$fm-real-lccy', customExchangeRate] } };
  target['fm-real-cum-tccy'] = { $sum: { $multiply: ['$fm-real-cum-lccy', customExchangeRate] } };
  if (customExchangeRate === '$tccy-er') {
    target['avg-tccy-er'] = { $avg: customExchangeRate };
  }
}

const forecastGroupingStrategy = {
  default: {
    groupId: {
      daily: buildDefaultDailyGroupId,
      weekly: buildDefaultRangedGroupId,
      monthly: buildDefaultRangedGroupId,
      yearly: buildDefaultRangedGroupId,
    },
    accumulators: {
      daily: (context) => buildForecastDailyAccumulators(context),
      weekly: (context) => buildForecastRangedAccumulators(context),
      monthly: (context) => buildForecastRangedAccumulators(context),
      yearly: (context) => buildForecastRangedAccumulators(context),
    }
  },
};
