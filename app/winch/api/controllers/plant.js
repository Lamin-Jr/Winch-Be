const mongoose = require('mongoose');

const Plant = require('../models/plant');
const VillageCtrl = require('./village');

const PlantCardCtrl = require('./plant/card');
const PlantLogCtrl = require('./plant/log');

const {
  // JsonObjectTypes,
  JsonObjectHelper,
} = require('../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const {
  BasicRead,
  BasicWrite,
} = require('../../../../api/middleware/crud');
const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Plant, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnName
exports.autocomplete = (req, res, next) => {
  BasicRead.autocomplete(req, res, next, Plant, 'name', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// DEPRECATED
// cRud/aggregateForMap
exports.aggregate_for_map = (req, res, next) => {
  PlantCardCtrl.list(req, res, next)
}

// DEPRECATED
// cRud/aggregateForGenTotalizers
exports.aggregate_for_gen_totalizers = (req, res, next) => {
  PlantLogCtrl.e_gen(req, res, next);
}

// DEPRECATED
// cRud/aggregateForSoldTotalizers
exports.aggregate_for_sold_totalizers = (req, res, next) => {
  PlantLogCtrl.e_deliv(req, res, next)
};

// DEPRECATED
// cRud/aggregateForDeliveryTotalizers
exports.aggregate_for_delivery_totalizers = (req, res, next) => {
  PlantLogCtrl.e_deliv_cat(req, res, next)
};

// DEPRECATED
// cRud/aggregateForPlant
exports.aggregate_for_plant = (req, res, next) => {
  PlantCardCtrl.detailed(req, res, next)
};

// DEPRECATED
// cRud/aggregateForFinancial
exports.aggregate_for_financial = (req, res, next) => {
  PlantLogCtrl.financial(req, res, next)
};

// Crud
exports.create = (req, res, next) => {
  VillageCtrl.village_exists_by_id(req.body.village)
    .then(() => exports.generatePlantId(req.body))
    .then((generatedPlantId) => {
      const plant = new Plant({
        _id: generatedPlantId,
        //
        // set/overwrite readonly fields
        ...mongooseMixins.makeCreatorByUserData(req.userData),
        enabled: false,
        //
        // set user fields
        name: req.body.name,
        project: req.body.project,
        geo: req.body.geo,
        village: new mongoose.Types.ObjectId(req.body.village),
        dates: req.body.dates,
        setup: req.body.setup,
        tariffs: req.body.tariffs,
        'add-ons': req.body['add-ons'],
        stats: req.body.stats,
        organization: req.body.organization,
      });

      BasicWrite.create(req, res, next, plant);
    })
    .catch(checkError => {
      WellKnownJsonRes.conflict(res);
    });
};


//
// utils

// cRud/existsById
exports.plantExistsById = plantId => {
  return new Promise((resolve, reject) => {
    Plant.countDocuments({ _id: plantId })
      .exec()
      .then(countResult => {
        countResult === 0
          ? reject(new Error(`plant '${plantId}' does not exist`))
          : resolve();
      })
      .catch(countError => {
        reject(countError);
      });
  });
};

// cRud/filteredPlants
exports.filteredPlants = (plantsFilter, plantsStatusFilter, plantsLocationsFilter, projection, sort, includeCountryInfo = false) => {
  return new Promise((resolve, reject) => {
    let aggregation = buildFilterPlantAggregation(plantsFilter, plantsStatusFilter, plantsLocationsFilter, false, includeCountryInfo)

    if (JsonObjectHelper.isNotEmpty(sort)) {
      aggregation = aggregation.sort(sort);
    }

    if (JsonObjectHelper.isNotEmpty(projection)) {
      aggregation = aggregation.project(projection);
    }

    aggregation = aggregation.allowDiskUse(true);

    aggregation.exec()
      .then(readResult => resolve(readResult))
      .catch(error => reject(error))
  })
};

// cRud/filteredPlantIds
exports.filteredPlantIds = (plantsFilter, plantsStatusFilter, plantsLocationsFilter) => {
  return new Promise((resolve, reject) => {
    let aggregation = buildFilterPlantAggregation(plantsFilter, plantsStatusFilter, plantsLocationsFilter)
      .project({ _id: 1 })
      .allowDiskUse(true)
      //
      ;

    aggregation.exec()
      .then(readResult => resolve(readResult))
      .catch(error => reject(error))
  })
};

// cRud/filteredEGenDriverPlants
exports.filteredEGenDriverPlants = (plantsFilter, plantsStatusFilter, plantsLocationsFilter) => {
  return new Promise((resolve, reject) => {
    let aggregation = Plant.aggregate()
      .match(plantsFilter)
      //
      ;

    if (plantsStatusFilter) {
      aggregation = aggregation
        .lookup({
          from: 'plants-status',
          localField: '_id',
          foreignField: '_id',
          as: 'monitor'
        })
        .unwind('$monitor')
        .match(plantsStatusFilter);
    }

    if (plantsLocationsFilter) {
      aggregation = aggregation
        .lookup({
          from: 'villages',
          localField: 'village',
          foreignField: '_id',
          as: 'village'
        })
        .unwind('$village')
        .match(plantsLocationsFilter);
    }

    aggregation = aggregation
      .lookup({
        from: 'plants-drivers',
        localField: '_id',
        foreignField: '_id',
        as: 'driver'
      })
      .unwind('$driver')
      .unwind('$driver.e-gen')
      .group({
        _id: '$driver.e-gen',
        plants: { $addToSet: '$_id' }
      })
      //
      ;

    aggregation = aggregation.allowDiskUse(true);

    aggregation.exec()
      .then(readResult => resolve(readResult))
      .catch(error => reject(error))
  });
};

// cRud/filteredEDelivDriverPlants
exports.filteredEDelivDriverPlants = (plantsFilter, plantsStatusFilter, plantsLocationsFilter) => {
  return new Promise((resolve, reject) => {
    let aggregation = Plant.aggregate()
      .match(plantsFilter)
      //
      ;

    if (plantsStatusFilter) {
      aggregation = aggregation
        .lookup({
          from: 'plants-status',
          localField: '_id',
          foreignField: '_id',
          as: 'monitor'
        })
        .unwind('$monitor')
        .match(plantsStatusFilter);
    }

    if (plantsLocationsFilter) {
      aggregation = aggregation
        .lookup({
          from: 'villages',
          localField: 'village',
          foreignField: '_id',
          as: 'village'
        })
        .unwind('$village')
        .match(plantsLocationsFilter);
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
      .then(readResult => resolve(readResult))
      .catch(error => reject(error))
  });
};

// other/generatePlantId
exports.generatePlantId = (target = { project: {} }) => {
  return new Promise((resolve, reject) => {
    if (!target.project.id) {
      reject(new Error('missing project \'id\' required field'));
    }
    if (!target.project.code) {
      reject(new Error('missing project \'code\' required field'));
    }

    // basic regex: /^\|\w+\|\w+\|/
    const queryByIdRegex = new RegExp(`^\\|${target.project.id}\\|${target.project.code}\\|`);

    Plant.countDocuments({ '_id': queryByIdRegex })
      .exec()
      .then(countResult => {
        resolve(`|${target.project.id}|${target.project.code}|${countResult + 1}|`)
      })
      .catch(countError => {
        reject(countError);
      });
  });
}

// DEPRECATED
exports.aggregateDelivery = (
  period = 'daily',
  filter = {},
  q = { sort: { _id: 1 } }
) => {
  return PlantLogCtrl.aggregateDelivery(period, filter, q);
};

// DEPRECATED
exports.aggregateDeliveryByCustomerCategory = (
  period = 'daily',
  filter = {},
  context = {
    aggregator: undefined,
    'exchange-rate': undefined,
  },
  q = { sort: { _id: 1 } },
) => {
  return PlantLogCtrl.aggregateDeliveryByCustomerCategory(period, filter, context, q);
};


//
// private part

const buildFilterPlantAggregation = (plantsFilter, plantsStatusFilter, plantsLocationsFilter, autoProjection = true, includeCountryInfo = false) => {
  let result = Plant.aggregate()
    // plantsFilter is always not empty
    // at least selects enabled plants
    .match(plantsFilter)
    //
    ;

  if (plantsStatusFilter) {
    result = result
      .lookup({
        from: 'plants-status',
        localField: '_id',
        foreignField: '_id',
        as: 'monitor'
      })
      .unwind('$monitor')
      //
      ;
    if (autoProjection) {
      result = result.project({
        project: 1,
        village: 1,
        'monitor.status': 1,
      });
    }
    if (JsonObjectHelper.isNotEmpty(plantsStatusFilter)) {
      result = result.match(plantsStatusFilter);
    }
  }

  if (plantsLocationsFilter) {
    result = result
      .lookup({
        from: 'villages',
        localField: 'village',
        foreignField: '_id',
        as: 'village'
      })
      .unwind('$village')
      //
      ;
    if (includeCountryInfo) {
      result = result
        .lookup({
          from: 'countries',
          localField: 'village.country',
          foreignField: '_id',
          as: 'village.country'
        })
        .unwind('$village.country')
        //
        ;
    }
    if (autoProjection) {
      result = result.project({
        village: 1,
      })
    }
    if (JsonObjectHelper.isNotEmpty(plantsLocationsFilter)) {
      result = result.match(plantsLocationsFilter);
    }
  }

  return result;
}
// const result = {
//   ...groupingByPeriod[period]
// };

//   const fieldsNamesToAggregate = Object.keys(projection);
//   const aggregations = buildReadingsAggregation(exchangeRate);
//   const fieldsToAggregate = {};
//   if (fieldsNamesToAggregate.length) {
//     const negativeProjection = Object.values(projection)[0] === 0;

//     if (negativeProjection) {
//       Object.assign(fieldsToAggregate, aggregations);

//       fieldsNamesToAggregate.forEach(field => {
//         delete fieldsToAggregate[field]
//       });
//     } else {
//       const fieldsToAdd = {};
//       fieldsNamesToAggregate.forEach(field => {
//         fieldsToAdd[field] = aggregations[field];
//       });

//       Object.assign(fieldsToAggregate, fieldsToAdd);
//     }
//   } else {
//     Object.assign(fieldsToAggregate, aggregations);
//   }

//   Object.assign(result, fieldsToAggregate);

//   return result;
// };
