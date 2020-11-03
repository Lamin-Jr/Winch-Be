const mongoose = require('mongoose');

const PlantService = require('../../../models/plant-service');

const Plant = require('../../../models/plant');

const PlantCtrl = require('../../../controllers/plant');

const {
  // JsonObjectTypes,
  JsonObjectHelper,
} = require('../../../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../../api/middleware/json-response-util');
const {
  BasicRead,
  // BasicWrite,
} = require('../../../../../../api/middleware/crud');
// const mongooseMixins = require('../../../../../../api/middleware/mongoose-mixins');

const {
  buildPlantFiltersRepo
} = require('../../../controllers/plant/_shared');


//
// endpoint-related

// cRud/sales
exports.sales = (req, res, next) => {
  exports.aggregateSales(
    req.params.period,
    buildPlantFiltersRepo(req.body.filter, req.params.period === 'daily'),
    req.body.filter.classes || [],
    req.body.context,
    req._q)
    .then(aggregateResult => {
      if (aggregateResult.handledError) {
        WellKnownJsonRes.error(res, aggregateResult.handledError.status, aggregateResult.handledError.messages)
      } else {
        WellKnownJsonRes.okMulti(res, aggregateResult.readResult.length, aggregateResult.readResult, aggregateResult.context.skip, aggregateResult.context.limit);
      }
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });
};


//
// private part

exports.aggregateSales = (
  period = 'daily',
  filtersRepo,
  classes = [],
  context = {},
  q = {},
) => {
  return new Promise((resolve, reject) => {
    try {
      Promise.all([
        PlantCtrl.filteredPlantIds(filtersRepo.plantsFilter, filtersRepo.plantsStatusFilter, filtersRepo.plantsLocationsFilter),
        Plant.countDocuments().exec()
      ])
        .then(promiseAllResult => {
          const readResult = promiseAllResult[0];

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

          const countResult = promiseAllResult[1];

          if (countResult > readResult.length) {
            const plantIdList = readResult.map(itemBody => itemBody._id);

            filtersRepo.targetFilter['_id.m'] = plantIdList == 1
              ? plantIdList[0]
              : { $in: plantIdList }
          }

          if (classes.length) {
            filtersRepo.targetFilter['_id.t'] = classes == 1
              ? classes[0]
              : { $in: classes };
          }

          const saleGrouping = buildSaleGrouping(period, context || {});
          if (!saleGrouping) {
            resolve({
              handledError: {
                status: 400,
                messages: [`unsupported aggregator: '${context.aggregator}'`],
              }
            })
            return;
          }

          // perform actual aggregation
          //
          const schema = require(`../../../../api/schemas/readings/service-sale-${period}-log`);
          const ServiceSalePeriodModel = require('../../../middleware/mongoose-db-conn')
            .winchDBConn
            .model(`ServiceSale${period.charAt(0).toUpperCase() + period.slice(1)}`, schema);
          let aggregation = ServiceSalePeriodModel.aggregate();

          if (JsonObjectHelper.isNotEmpty(filtersRepo.targetFilter)) {
            aggregation = aggregation.match(filtersRepo.targetFilter);
          }

          aggregation = aggregation
            .group(saleGrouping)
            .sort(JsonObjectHelper.isNotEmpty(q.sort)
              ? q.sort
              : { _id: 1 })
            //
            ;

          if (JsonObjectHelper.isNotEmpty(q.proj)) {
            aggregation = aggregation.project(q.proj);
          }

          const localContext = {
            skip: q.skip && q.skip > 0 ? q.skip : undefined,
            limit: q.limit && q.limit > 0 ? q.limit : undefined,
          };

          if (localContext.skip) {
            aggregation = aggregation.skip(localContext.skip);
          }
          if (localContext.limit) {
            aggregation = aggregation.limit(localContext.limit);
          }

          aggregation.exec()
            .then(readResult => {
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

const buildSaleGrouping = (period, context) => {
  const aggregatorStrategy = saleGroupingStrategy[context.aggregator || 'default'];
  try {
    return {
      _id: aggregatorStrategy.groupId[period](),
      ...aggregatorStrategy.accumulators[period](context),
    };
  } catch {
    return undefined;
  }
};

const buildSaleDailyGroupId = () => {
  return '$d';
};

const buildSaleRangedGroupId = () => {
  return {
    b: '$d',
    e: '$dt',
  }
};

const getSaleBasicAccumulators = () => {
  return {
    'tx-p-c': { $sum: '$tx-p-c' },
    'tx-p-cum': { $sum: '$tx-p-cum' },
    'tx-p-lccy': { $sum: '$tx-p-lccy' },
    'r-g-lccy': { $sum: '$r-g-lccy' },
    'r-agf-lccy': { $sum: '$r-agf-lccy' },
    'r-opf-lccy': { $sum: '$r-opf-lccy' },
    'r-n-lccy': { $sum: '$r-n-lccy' },
    'e-cons': { $sum: '$e-cons' },
    'e-cons-lccy': { $sum: '$e-cons-lccy' },
    'fm-fcst-lccy': { $sum: '$fm-fcst-lccy' },
    'fm-fcst-cum-lccy': { $sum: '$fm-fcst-cum-lccy' },
    'fm-real-cum-lccy': { $sum: '$fm-real-cum-lccy' },
  }
}

const buildSaleDailyAccumulators = (context) => {
  const result = {
    'ts': { '$first': '$ts' },
    ...getSaleBasicAccumulators(),
  };
  applyCustomExchangeRate(result, context['exchange-rate'] || '$tccy-er')
  return result;
};

const buildSaleRangedAccumulators = (context) => {
  const result = {
    'tsf': { $first: '$ts' },
    'tst': { $first: '$tst' },
    ...getSaleBasicAccumulators(),
  };
  applyCustomExchangeRate(result, context['exchange-rate'] || '$tccy-er')
  return result;
};

const applyCustomExchangeRate = (target, customExchangeRate) => {
  target['tx-p-tccy'] = { $sum: { $multiply: ['$tx-p-lccy', customExchangeRate] } };
  target['r-g-tccy'] = { $sum: { $multiply: ['$r-g-lccy', customExchangeRate] } };
  target['r-agf-tccy'] = { $sum: { $multiply: ['$r-agf-lccy', customExchangeRate] } };
  target['r-opf-tccy'] = { $sum: { $multiply: ['$r-opf-lccy', customExchangeRate] } };
  target['r-n-tccy'] = { $sum: { $multiply: ['$r-n-lccy', customExchangeRate] } };
  target['e-cons-tccy'] = { $sum: { $multiply: ['$e-cons-lccy', customExchangeRate] } };
  target['fm-fcst-tccy'] = { $sum: { $multiply: ['$fm-fcst-lccy', customExchangeRate] } };
  target['fm-fcst-cum-tccy'] = { $sum: { $multiply: ['$fm-fcst-cum-lccy', customExchangeRate] } };
  target['fm-real-cum-tccy'] = { $sum: { $multiply: ['$fm-real-cum-lccy', customExchangeRate] } };
  if (customExchangeRate === '$tccy-er') {
    target['avg-tccy-er'] = { $avg: customExchangeRate };
  }
}

const buildSaleRangedGroupByServicesId = () => {
  return {
    ...buildDeliveryRangedGroupId(),
    s: "$_id",
  }
}

const saleGroupingStrategy = {
  default: {
    groupId: {
      daily: buildSaleDailyGroupId,
      weekly: buildSaleRangedGroupId,
      monthly: buildSaleRangedGroupId,
      yearly: buildSaleRangedGroupId,
    },
    accumulators: {
      daily: (context) => buildSaleDailyAccumulators(context),
      weekly: (context) => buildSaleRangedAccumulators(context),
      monthly: (context) => buildSaleRangedAccumulators(context),
      yearly: (context) => buildSaleRangedAccumulators(context),
    }
  },
  services: {
    groupId: {
      daily: () => {
        return {
          d: buildSaleDailyGroupId(),
          s: "$_id",
        };
      },
      weekly: buildSaleRangedGroupByServicesId,
      monthly: buildSaleRangedGroupByServicesId,
      yearly: buildSaleRangedGroupByServicesId,
    },
    accumulators: {
      daily: (context) => buildSaleDailyAccumulators(context),
      weekly: (context) => buildSaleRangedAccumulators(context),
      monthly: (context) => buildSaleRangedAccumulators(context),
      yearly: (context) => buildSaleRangedAccumulators(context),
    }
  },
};

