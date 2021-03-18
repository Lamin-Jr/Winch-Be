exports.buildDefaultDailySort = () => {
  return { _id: 1 };
};

exports.buildDefaultRangedSort = () => {
  return {
    '_id.b': 1,
    '_id.e': 1,
  };
};

exports.buildDeliveryRangedSortByCategoriesId = () => {
  return {
    '_id.ct': 1,
    ...exports.buildDefaultRangedSort(),
  };
};

exports.buildDeliveryRangedSortByPodsId = () => {
  return {
    '_id.pod': 1,
    ...exports.buildDefaultRangedSort(),
  };
};
