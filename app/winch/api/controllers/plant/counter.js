const mongoose = require('mongoose');

const PlantCtrl = require('../../controllers/plant');

const {
  DateFormatter,
} = require('../../../../../api/lib/util/formatter');
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

const {
  buildPlantFilters,
  buildPlantFiltersRepo
} = require('./_shared')
const {
  buildDeliveryGroupId
} = require('./_grouping_e-deliv')
const {
  buildDeliverySorting
} = require('./_sorting_e-deliv')


//
// endpoint-related

// cRud/filterItems
exports.filterItems = (req, res, next) => {
  const plantFilters = buildPlantFilters(req.body.filter)

  PlantCtrl.filteredPlants(
    plantFilters.plantsFilter,
    plantFilters.plantsStatusFilter || {},
    plantFilters.plantsLocationsFilter || {},
    {
      _id: 1,
      'project.id': 1,
      'monitor.status': 1,
      'village._id': 1,
      'village.country': 1
    })
    .then(readResult => new Promise(resolve => {
      const counters = {
        c: new Set(),
        v: new Set(),
        p: new Set(),
        ps: new Set(),
      }
      readResult.forEach(plant => {
        counters.c.add(plant.village.country);
        counters.v.add(plant.village._id);
        counters.p.add(plant._id);
        counters.ps.add(plant.monitor.status);
      });
      resolve({
        countries: counters.c.size,
        villages: counters.v.size,
        plants: counters.p.size,
        'plant-statuses': counters.ps.size,
      })
    }))
    .then(countResult => WellKnownJsonRes.okSingle(res, countResult))
    .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
}

// cRud/eCustomersByPeriod
exports.eCustomersByPeriod = (req, res, next) => {
  exports.aggregateECustomersByPeriod(
    req.params.period,
    req.body.filter,
    req.body.context,
  )
    .then(eCustomerCounters => {
      WellKnownJsonRes.okMulti(res, eCustomerCounters.length, eCustomerCounters);
    })
    .catch(readError => {
      if (readError.status) {
        WellKnownJsonRes.error(res, readError.status, [readError.message])
      } else {
        WellKnownJsonRes.errorDebug(res, readError)
      }
    });
};

// cRud/co2Avoidance
exports.eCo2Avoidance = (req, res, next) => {
  let monthReference = new Date();
  monthReference = new Date(new Date(monthReference).setDate(monthReference.getDate() - 3));
  monthReference = new Date(monthReference.setDate(1));
  const filter = {
    tsFrom: DateFormatter.formatDateOrDefault(new Date(new Date(monthReference).setDate(monthReference.getDate() - 3)), DateFormatter.buildISODateFormatter()),
    tsTo: DateFormatter.formatDateOrDefault(monthReference, DateFormatter.buildISODateFormatter()),
  }

  Promise.all([
    PlantCtrl.aggregateDeliveryByCustomerCategory('all')
      .then(aggregationMeta => aggregationMeta.aggregation.exec()),
    PlantCtrl.aggregateDeliveryByCustomerCategory('daily', filter)
      .then(aggregationMeta => aggregationMeta.aggregation.exec()),
  ])
    .then(promiseAllResult => {
      let averageProduction = 0.0
      promiseAllResult[1].forEach(sample => {
        averageProduction += (sample.ep + sample.es);
      });
      averageProduction /= promiseAllResult[1].length;

      WellKnownJsonRes.okSingle(res, {
        startDate: filter.tsTo,
        initialProductionkWh: Math.round(promiseAllResult[0][0].ep + promiseAllResult[0][0].es * 100) / 100,
        installedPowerkWh: 365.46,
        productionPerMinute: Math.round(averageProduction / 24 / 60 * 100) / 100,
      });
      // FIXME: WellKnownJsonRes.notImplemented(res);
    })
    .catch(readError => {
      if (readError.status) {
        WellKnownJsonRes.error(res, readError.status, [readError.message]);
      } else {
        WellKnownJsonRes.errorDebug(res, readError);
      }
    });
};


//
// utils

exports.aggregateECustomersByPeriod = (
  period = 'all',
  filter = {},
  context = {
    aggregator: undefined,
  },
) => {
  return new Promise((resolve, reject) => {
    const plantFiltersRepo = buildPlantFiltersRepo(filter, true);

    PlantCtrl.filteredEDelivDriverPlants(plantFiltersRepo.plantsFilter, plantFiltersRepo.plantsStatusFilter, plantFiltersRepo.plantsLocationsFilter)
      .then(readResult => {
        if (!readResult.length) {
          const error = new Error('selection did not result in any plant');
          error.status = 404;
          reject(error);
          return;
        } else if (readResult.length !== 1) {
          const error = new Error('unable to query more than one driver at once');
          error.status = 501;
          reject(error);
          return;
        }

        Object.assign(plantFiltersRepo.targetFilter, {
          '_id.m': readResult[0].plants.length == 1
            ? readResult[0].plants[0]
            : { $in: readResult[0].plants },
        });

        // perform actual aggregations
        //
        const isAllPeriod = period === 'all'
        const periodModelSelector = isAllPeriod
          ? 'daily'
          : period;

        const schema = require(`../../../api/schemas/readings/customer-${periodModelSelector}-log`);
        const CustomerPeriodModel = require('../../middleware/mongoose-db-conn').driverDBConnRegistry
          .get(readResult[0]._id)
          .model(`Customer${periodModelSelector.charAt(0).toUpperCase() + periodModelSelector.slice(1)}`, schema);

        const operationalsGroupStatement = {
          _id: isAllPeriod
            ? {
              pod: '$pod',
              d: '$ts'
            }
            : buildDeliveryGroupId(
              period,
              {
                aggregator: context.aggregator || undefined,
                'exchange-rate': undefined,
                'show-pods': false
              }),
          consumingBySelling: {
            $sum: {
              $cond: [{ $gt: ['$es', 0.0] }, 1, 0]
            }
          },
          consumingByService: {
            $sum: {
              $cond: [{ $gt: ['$ep', 0.0] }, 1, 0]
            }
          },
        };
        if (isAllPeriod || context.aggregator !== 'customers') {
          operationalsGroupStatement.working = { $sum: 1 };
        }
        if (context.aggregator === 'customers') {
          operationalsGroupStatement.ctList = { $addToSet: '$ct' };
        }

        let operationalsAggregation = CustomerPeriodModel.aggregate()
          .match(plantFiltersRepo.targetFilter)
          .group(operationalsGroupStatement)
          //
          ;

        if (isAllPeriod) {
          operationalsAggregation = operationalsAggregation
            .group({
              _id: '$_id.d',
              consumingBySelling: { $sum: '$consumingBySelling' },
              consumingByService: { $sum: '$consumingByService' },
              working: { $sum: '$working' },
            })
            .group({
              _id: null,
              b: {
                $min: '$_id'
              },
              e: {
                $max: '$_id'
              },
              sampledDays: { $sum: 1 },
              totalDays: { $sum: 1 },
              minConsumingBySelling: { $min: '$consumingBySelling' },
              avgConsumingBySellingAvg: { $avg: '$consumingBySelling' },
              maxConsumingBySellingMax: { $max: '$consumingBySelling' },
              minConsumingByService: { $min: '$consumingByService' },
              avgConsumingByService: { $avg: '$consumingByService' },
              maxConsumingByService: { $max: '$consumingByService' },
              minWorking: { $min: '$working' },
              avgWorking: { $avg: '$working' },
              maxWorking: { $max: '$working' },
            })
            .addFields({
              totalDays: {
                $sum: [{ $divide: [{ $subtract: ['$e', '$b'] }, 1000 * 60 * 60 * 24] }, 1]
              }
            })
            //
            ;
        }

        operationalsAggregation = operationalsAggregation
          .sort(buildDeliverySorting(period, context))
          //
          ;

        operationalsAggregation = operationalsAggregation
          .allowDiskUse(true)
          //
          ;

        Promise.all([
          operationalsAggregation,
          PlantCtrl.getConnectionDateList(new Date(filter.tsTo), readResult[0].plants),
        ])
          .then(promiseAllResult => {
            if (promiseAllResult[0].length && context.aggregator !== 'customers') {
              const isDailyModel = periodModelSelector === 'daily';
              // avoid huge response with trivial data
              // if needed, remove second term of root boolean expression and uncomment below
              // const isAggregatedByCustomers = context.aggregator === 'customers';
              const disabledAggregator = context.aggregator === undefined;
              const isAggregatedByCategories = context.aggregator === 'categories';
              const totalConnectedStatus = {
                i: null,
                c: 0,
                lastItem: false,
                getTime: function () {
                  return this.i === null ? null : promiseAllResult[1][this.i]._id;
                },
                nextStatus: function () {
                  if (this.i === null || this.lastItem) {
                    return false;
                  }
                  this.c += promiseAllResult[1][this.i].c;
                  if (isAggregatedByCategories) {
                    Object.entries(promiseAllResult[1][this.i]).forEach(commCatCountEntry => {
                      if (['_id', 'c'].includes(commCatCountEntry[0])) {
                        return;
                      }
                      this.commCatCounter[commCatCountEntry[0]] = this.commCatCounter[commCatCountEntry[0]] || 0;
                      this.commCatCounter[commCatCountEntry[0]] += commCatCountEntry[1];
                      this.expectedCommCat.add(commCatCountEntry[0])
                    });
                  }
                  if (promiseAllResult[1].length === this.i + 1) {
                    this.lastItem = true;
                    return false;
                  }
                  this.i++;
                  return true;
                }
              };
              if (isAggregatedByCategories) {
                totalConnectedStatus.commCatCounter = {};
                totalConnectedStatus.expectedCommCat = new Set();
                totalConnectedStatus.sampledCommCat = {};
              }
              if (promiseAllResult[1].length) {
                totalConnectedStatus.d = promiseAllResult[1][0]._id;
                totalConnectedStatus.i = 0;
              }
              promiseAllResult[0].forEach(countSample => {
                if (totalConnectedStatus.i === null) {
                  countSample['connected'] = 0;
                  // avoid huge response with trivial data
                  // if necessary, remove second term of root boolean expression and uncomment below
                  // } if (isAggregatedByCustomers) {
                  //   // countSample['connected'] = countSample['working'] = 1;
                } else {
                  const rawSampleDate = isDailyModel
                    ? disabledAggregator
                      ? countSample._id
                      : countSample._id.d
                    : countSample._id.e;
                  if (isAggregatedByCategories) {
                    totalConnectedStatus.sampledCommCat[rawSampleDate] = totalConnectedStatus.sampledCommCat[rawSampleDate] || new Set();
                    totalConnectedStatus.sampledCommCat[rawSampleDate].add(countSample._id.ct);
                  }
                  const sampleDate = new Date(rawSampleDate);
                  while (sampleDate.getTime() >= totalConnectedStatus.getTime() || rawSampleDate === null) {
                    if (!totalConnectedStatus.nextStatus()) {
                      break;
                    }
                  }
                  switch (context.aggregator) {
                    // avoid huge response with trivial data
                    // if necessary, remove second term of root boolean expression and uncomment below
                    // case 'customers':
                    //   countSample['connected'] = 1;
                    //   break;
                    case 'categories':
                      countSample['connected'] = totalConnectedStatus.commCatCounter[countSample._id.ct];
                      break;
                    default:
                      countSample['connected'] = totalConnectedStatus.c;
                      break;
                  }
                }
              });
              if (isAggregatedByCategories) {
                Object.entries(totalConnectedStatus.sampledCommCat).forEach(sampledCommCatEntry => {
                  const missingCommCat = new Set([...totalConnectedStatus.expectedCommCat].filter(commCat => !sampledCommCatEntry[1].has(commCat)));
                  if (missingCommCat.size) {
                    [...missingCommCat].map(commCat => {
                      const sampleDate = new Date(sampledCommCatEntry[0]);
                      let connectedCount = 0, counterIndex = 0;

                      while (counterIndex < promiseAllResult[1].length
                        && sampleDate.getTime() >= promiseAllResult[1][counterIndex]._id.getTime()) {
                        connectedCount += promiseAllResult[1][counterIndex][commCat]
                        counterIndex++;
                      }

                      promiseAllResult[0].push({
                        _id: isDailyModel
                          ? {
                            d: sampledCommCatEntry[0],
                            ct: commCat,
                          }
                          : {
                            b: DateFormatter.formatDateOrDefault(
                              new Date(new Date(sampledCommCatEntry[0]).setMonth(new Date(sampledCommCatEntry[0]).getMonth() - 1)),
                              DateFormatter.buildISOZoneDateFormatter(),
                            ),
                            e: sampledCommCatEntry[0],
                            ct: commCat,
                          },
                        consumingBySelling: 0,
                        consumingByService: 0,
                        working: 0,
                        connected: connectedCount,
                      })
                    });
                  }
                });
              }
            }
            resolve(promiseAllResult[0]);
          })
          .catch(readError => reject(readError));
      });
  });
};