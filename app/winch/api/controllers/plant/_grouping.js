exports.buildDefaultAllGroupId = () => {
  return null;
};

exports.buildDefaultDailyGroupId = () => {
  return '$d';
};

exports.buildDefaultRangedGroupId = () => {
  return {
    b: '$d',
    e: '$dt',
  };
};

exports.buildDailyTimeRangeAccumulators = () => {
  return {
    'tsf': { $min: '$ts' },
    'tst': { $max: '$ts' },
  };
};

exports.applyAllPeriodDatesAdjust = (aggregation) => {
  const addDayStatement = { $add: ['$tst', 24 * 60 * 60000] }

  return aggregation.addFields({
    '_id': {
      b: {
        $dateToString: {
          date: '$tsf',
          format: '%Y-%m-%d',
        }
      },
      e: {
        $dateToString: {
          date: addDayStatement,
          format: '%Y-%m-%d',
        }
      },
    },
    'tst': addDayStatement
  });
};
