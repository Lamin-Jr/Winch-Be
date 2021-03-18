const {
  buildDefaultAllGroupId,
  buildDefaultDailyGroupId,
  buildDefaultRangedGroupId,
  buildDailyTimeRangeAccumulators,
} = require('./_grouping');


exports.buildDeliveryGroupId = (period, context) => {
  const aggregatorStrategy = deliveryGroupingStrategy[context.aggregator || 'default'];
  try {
    return aggregatorStrategy.groupId[period]();
  } catch {
    return undefined;
  }
};

exports.buildDeliveryGrouping = (period, context) => {
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


//
// private part

const buildDeliverySharedAccumulators = (context) => {
  return {
    ... (context.daysInPeriod
      ? { 'av': { $avg: { $divide: ['$avc', context.daysInPeriod * 96.0] } } }
      : { 'avc': { $sum: '$avc' } }),
    'b-lccy': { $avg: '$b-lccy' },
    'cnt': { $sum: 1 },
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

const buildDeliveryAllAccumulators = (context) => {
  const result = {
    ...buildDailyTimeRangeAccumulators(),
    ...buildDeliverySharedAccumulators(context),
  };
  applyDeliveryExchangeRate(result, context['exchange-rate'] || '$tccy-er');
  return result;
};

const buildDeliveryDailyAccumulators = (context) => {
  const result = {
    'ts': { $first: '$ts' },
    ...buildDeliverySharedAccumulators({ ...context, daysInPeriod: 1 }),
  };
  applyDeliveryExchangeRate(result, context['exchange-rate'] || '$tccy-er');
  return result;
};

const buildDeliveryRangedAccumulators = (context) => {
  const result = {
    'tsf': { $first: '$ts' },
    'tsfa': { $min: '$tsf' },
    'tst': { $first: '$tst' },
    ...buildDeliverySharedAccumulators(context),
  };
  applyDeliveryExchangeRate(result, context['exchange-rate'] || '$tccy-er');
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
};

// BEGIN GROUP: By categories
const buildDeliveryRangedGroupByCategoriesId = () => {
  return {
    ...buildDefaultRangedGroupId(),
    ct: "$ct",
  };
};

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
  };
};

const buildDeliveryRangedAccumulatorsByPods = (context) => {
  const result = buildDeliveryRangedAccumulators(context);
  delete result.pod;
  return result;
};
// END GROUP: By pods

const deliveryGroupingStrategy = {
  default: {
    groupId: {
      all: buildDefaultAllGroupId,
      daily: buildDefaultDailyGroupId,
      weekly: buildDefaultRangedGroupId,
      monthly: buildDefaultRangedGroupId,
      yearly: buildDefaultRangedGroupId,
    },
    accumulators: {
      all: (context) => buildDeliveryAllAccumulators(context),
      daily: (context) => buildDeliveryDailyAccumulators(context),
      weekly: (context) => buildDeliveryRangedAccumulators({ ...context, daysInPeriod: 7, }),
      monthly: (context) => buildDeliveryRangedAccumulators({ ...context, daysInPeriod: 30.4375, }),
      yearly: (context) => buildDeliveryRangedAccumulators({ ...context, daysInPeriod: 365.25, }),
    },
  },
  categories: {
    groupId: {
      all: buildDefaultAllGroupId,
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
      all: (context) => buildDeliveryAllAccumulators(context),
      daily: (context) => {
        const result = buildDeliveryDailyAccumulators(context);
        delete result.ct;
        return result;
      },
      weekly: (context) => buildDeliveryRangedAccumulatorsByCategories({ ...context, daysInPeriod: 7, }),
      monthly: (context) => buildDeliveryRangedAccumulatorsByCategories({ ...context, daysInPeriod: 30.4375, }),
      yearly: (context) => buildDeliveryRangedAccumulatorsByCategories({ ...context, daysInPeriod: 365.25, }),
    },
  },
  customers: {
    groupId: {
      all: buildDefaultAllGroupId,
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
      all: (context) => buildDeliveryAllAccumulators(context),
      daily: (context) => {
        const result = buildDeliveryDailyAccumulators(context);
        delete result.pod;
        return result;
      },
      weekly: (context) => buildDeliveryRangedAccumulatorsByPods({ ...context, daysInPeriod: 7, }),
      monthly: (context) => buildDeliveryRangedAccumulatorsByPods({ ...context, daysInPeriod: 30.4375, }),
      yearly: (context) => buildDeliveryRangedAccumulatorsByPods({ ...context, daysInPeriod: 365.25, }),
    },
  },
};
