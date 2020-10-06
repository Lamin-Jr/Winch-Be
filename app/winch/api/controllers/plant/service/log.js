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
  const isDailyPeriod = req.params.period === 'daily';
  const filtersRepo = buildPlantFiltersRepo(req.body.filter, isDailyPeriod)

  Promise.all([
    PlantCtrl.filteredPlantIds(filtersRepo.plantsFilter, filtersRepo.plantsStatusFilter, filtersRepo.plantsLocationsFilter),
    Plant.countDocuments().exec()
  ])
    .then(promiseAllResult => {
      const readResult = promiseAllResult[0];

      if (!readResult.length) {
        WellKnownJsonRes.okMulti(res, readResult.length, [], req._q.skip, req._q.limit)
        return;
      }

      const countResult = promiseAllResult[1];

      if (countResult > readResult.length) {
        const plantIdList = readResult.map(itemBody => itemBody._id);

        Object.assign(filtersRepo.targetFilter, {
          '_id.m': plantIdList == 1
            ? plantIdList[0]
            : { $in: plantIdList }
        })
      }

      const saleGrouping = buildSaleGrouping(req.params.period, req.body.context || {});
      if (!saleGrouping) {
        WellKnownJsonRes.error(res, 400, [`unsupported aggregator: '${req.body.context.aggregator}'`]);
        return;
      }

      // perform actual aggregation
      //
      const schema = require(`../../../../api/schemas/readings/service-sale-${req.params.period}-log`);
      const ServiceSaleOnPeriod = require('../../../middleware/mongoose-db-conn')
        .winchDBConn
        .model(`ServiceSale${req.params.period.charAt(0).toUpperCase() + req.params.period.slice(1)}`, schema);
      let aggregation = ServiceSaleOnPeriod.aggregate();

      if (JsonObjectHelper.isNotEmpty(filtersRepo.targetFilter)) {
        aggregation = aggregation.match(filtersRepo.targetFilter);
      }

      aggregation = aggregation
        .group(saleGrouping)
        .sort(JsonObjectHelper.isNotEmpty(req._q.sort)
          ? req._q.sort
          : { _id: 1 })
        //
        ;

      if (JsonObjectHelper.isNotEmpty(req._q.proj)) {
        aggregation = aggregation.project(req._q.proj);
      }

      BasicRead.aggregate(req, res, next, ServiceSaleOnPeriod, aggregation, req._q.skip, req._q.limit);
    })
    .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
};


//
// private part

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

