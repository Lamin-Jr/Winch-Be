const {
  buildDefaultDailySort,
  buildDefaultRangedSort,
  buildDeliveryRangedSortByCategoriesId,
  buildDeliveryRangedSortByPodsId,
} = require('./_sorting');


exports.buildDeliverySorting = (period, context) => {
  try {
    return deliverySortingStrategy[context.aggregator || 'default'][period]();
  } catch {
    return undefined;
  }
};


//
// private part

const deliverySortingStrategy = {
  default: {
    all: buildDefaultDailySort,
    daily: buildDefaultDailySort,
    weekly: buildDefaultRangedSort,
    monthly: buildDefaultRangedSort,
    yearly: buildDefaultRangedSort,
  },
  categories: {
    all: buildDefaultDailySort,
    daily: () => {
      return {
        '_id.ct': 1,
        ...buildDefaultDailySort(),
      };
    },
    weekly: buildDeliveryRangedSortByCategoriesId,
    monthly: buildDeliveryRangedSortByCategoriesId,
    yearly: buildDeliveryRangedSortByCategoriesId,
  },
  customers: {
    all: buildDefaultDailySort,
    daily: () => {
      return {
        '_id.pod': 1,
        ...buildDefaultDailySort(),
      };
    },
    weekly: buildDeliveryRangedSortByPodsId,
    monthly: buildDeliveryRangedSortByPodsId,
    yearly: buildDeliveryRangedSortByPodsId,
  },
};
