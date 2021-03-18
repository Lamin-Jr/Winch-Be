const mongoose = require('mongoose');

const PlantCtrl = require('../../controllers/plant');

// const {
//   DateFormatter,
// } = require('../../../../../api/lib/util/formatter');
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

// cRud/eCustomers
exports.eCustomers = (req, res, next) => {
  const plantFiltersRepo = buildPlantFiltersRepo(req.body.filter, true);

  PlantCtrl.filteredEDelivDriverPlants(plantFiltersRepo.plantsFilter, plantFiltersRepo.plantsStatusFilter, plantFiltersRepo.plantsLocationsFilter)
    .then(readResult => {
      if (!readResult.length) {
        WellKnownJsonRes.okSingle(res, {
          consuming: 0,
          working: 0,
        });
        return;
      } else if (readResult.length !== 1) {
        WellKnownJsonRes.notImplemented(res, 'unable to query more than one driver at once');
        return;
      }

      Object.assign(plantFiltersRepo.targetFilter, {
        '_id.m': readResult[0].plants.length == 1
          ? readResult[0].plants[0]
          : { $in: readResult[0].plants },
      });

      // perform actual aggregation
      //
      const schema = require(`../../../api/schemas/readings/customer-daily-log`);
      const CustomerPeriodModel = require('../../middleware/mongoose-db-conn').driverDBConnRegistry
        .get(readResult[0]._id)
        .model(`CustomerDaily`, schema);
      const aggregation = CustomerPeriodModel.aggregate()
        .match(plantFiltersRepo.targetFilter)
        .group({
          _id: {
            pod: '$pod',
            d: '$d'
          },
          consuming: {
            $sum: {
              $cond: [{ $gt: ['$es', 0.0] }, 1, 0]
            }
          },
          working: { $sum: 1 },
        })
        .group({
          _id: '$_id.d',
          consuming: { $sum: '$consuming' },
          working: { $sum: '$working' },
        })
        .sort({
          _id: 1,
        })
        //
        ;

      aggregation
        .then(readResult => {
          WellKnownJsonRes.okMulti(res, readResult.length, readResult);
        })
        .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
    })
    .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
};

// cRud/eCustomersByPeriod
exports.eCustomersByPeriod = (req, res, next) => {
  const plantFiltersRepo = buildPlantFiltersRepo(req.body.filter, true);

  PlantCtrl.filteredEDelivDriverPlants(plantFiltersRepo.plantsFilter, plantFiltersRepo.plantsStatusFilter, plantFiltersRepo.plantsLocationsFilter)
    .then(readResult => {
      if (!readResult.length) {
        WellKnownJsonRes.okSingle(res, {
          consuming: 0,
          working: 0,
          total: 0,
        });
        return;
      } else if (readResult.length !== 1) {
        WellKnownJsonRes.notImplemented(res, 'unable to query more than one driver at once');
        return;
      }

      Object.assign(plantFiltersRepo.targetFilter, {
        '_id.m': readResult[0].plants.length == 1
          ? readResult[0].plants[0]
          : { $in: readResult[0].plants },
      });

      // perform actual aggregations
      //
      const period = req.params.period;
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
            req.params.period,
            {
              aggregator: req.body.context ? req.body.context.aggregator : undefined,
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
      if (isAllPeriod || req.body.context.aggregator !== 'customers') {
        operationalsGroupStatement.working = { $sum: 1 };
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
        .sort(buildDeliverySorting(period, req.body.context))
        //
        ;

      operationalsAggregation = operationalsAggregation
        .allowDiskUse(true)
        //
        ;

      Promise.all([
        operationalsAggregation,
        PlantCtrl.getConnectionDateList(new Date(req.body.filter.tsTo), readResult[0].plants),
      ])
        .then(promiseAllResult => {
          if (promiseAllResult[0].length && req.body.context.aggregator === undefined) {
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
                if (promiseAllResult[1].length === this.i + 1) {
                  this.lastItem = true;
                  return false;
                }
                this.i++;
                return true;
              }
            };
            if (promiseAllResult[1].length) {
              totalConnectedStatus.d = promiseAllResult[1][0]._id;
              totalConnectedStatus.i = 0;
            }
            promiseAllResult[0].forEach(countSample => {
              if (totalConnectedStatus.i === null) {
                countSample['connected'] = 0;
              } else {
                const rawSampleDate = periodModelSelector === 'daily'
                  ? countSample._id
                  : countSample._id.e;
                const sampleDate = new Date(rawSampleDate);
                while (sampleDate.getTime() >= totalConnectedStatus.getTime() || rawSampleDate === null) {
                  if (!totalConnectedStatus.nextStatus()) {
                    break;
                  }
                }
                countSample['connected'] = totalConnectedStatus.c;
              }
            });
          }
          WellKnownJsonRes.okMulti(res, promiseAllResult[0].length, promiseAllResult[0]);
        })
        .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
    })
    .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
};
