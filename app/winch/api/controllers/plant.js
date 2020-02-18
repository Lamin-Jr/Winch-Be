const mongoose = require('mongoose');

const Plant = require('../models/plant');
const VillageCtrl = require('./village');

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

// cRud/aggregateForMap
exports.aggregate_for_map = (req, res, next) => {
  const plantsFilter = {
    enabled: true
  }
  let plantsStatusFilter = undefined;
  let locationsFilter = undefined;

  if (req.body.filter) {
    if (req.body.filter.plants && req.body.filter.plants.length) {
      Object.assign(plantsFilter, {
        _id: { '$in': req.body.filter.plants }
      })
    }
    if (req.body.filter.projects && req.body.filter.projects.length) {
      Object.assign(plantsFilter, {
        'project.id': { '$in': req.body.filter.projects }
      })
    }
    if (req.body.filter['plants-status'] && req.body.filter['plants-status'].length) {
      plantsStatusFilter = {
        'monitor.status': { '$in': req.body.filter['plants-status'] }
      }
    }
    if (req.body.filter.villages && req.body.filter.villages.length) {
      locationsFilter = {
        'village._id': { '$in': req.body.filter.villages.map(idAsString => new mongoose.Types.ObjectId(idAsString)) }
      }
    }
    if (req.body.filter.countries && req.body.filter.countries.length) {
      if (!locationsFilter) {
        locationsFilter = {}
      }

      Object.assign(locationsFilter, {
        'village.country._id': { '$in': req.body.filter.countries }
      })
    }
  }

  const project = {
    name: 1,
    project: 1,
    geo: 1,
    village: 1,
    setup: 1,
    stats: 1,
    'monitor.status': 1,
    'monitor.messages': 1
  };
  
  let aggregation = Plant.aggregate()
    .match(plantsFilter)
    .lookup({
      from: 'plants-status',
      localField: '_id',
      foreignField: '_id',
      as: 'monitor'
    })
    .unwind('$monitor')
    .project(project);

  if (plantsStatusFilter) {
    aggregation = aggregation.match(plantsStatusFilter);
  }

  delete project.village;
  Object.assign(project, {
    'village._id': 1,
    'village.name': 1,
    'village.geo': 1,
    // 'village.country': 1
    'village.country._id': 1,
    'village.country.default-name': 1,
    'village.country.aplha-3-code': 1,
    'village.country.numeric-code': 1
});

aggregation = aggregation
    .lookup({
      from: 'villages',
      localField: 'village',
      foreignField: '_id',
      as: 'village'
    })
    .unwind('$village')
    .lookup({
      from: 'countries',
      localField: 'village.country',
      foreignField: '_id',
      as: 'village.country'
    })
    .unwind('$village.country');

  if (locationsFilter) {
    aggregation = aggregation.match(locationsFilter);
  }

  if (JsonObjectHelper.isNotEmpty(req._q.sort)) {
    aggregation = aggregation.sort(req._q.sort);
  }

  aggregation = aggregation.project(project);

  if (JsonObjectHelper.isNotEmpty(req._q.proj)) {
    aggregation = aggregation.project(req._q.proj);
  }

  aggregation = aggregation.allowDiskUse(true);

  BasicRead.aggregate(req, res, next, Plant, aggregation, req._q.skip, req._q.limit);
};

// cRud/aggregateForGenTotalizers
exports.aggregate_for_gen_totalizers = (req, res, next) => {
  const isDailyPeriod = req.params.period === 'daily';
  const readingsFilter = {
  };
  const getPlantIdsFilter = {
    enabled: true
  };
  let plantsStatusFilter = undefined;
  let locationsFilter = undefined;

  // retrieve totalizers filter: plant ids + date range
  //
  if (req.body.filter) {
    if (req.body.filter.tsFrom) {
      readingsFilter.ts = readingsFilter.ts || {};
      readingsFilter.ts['$gte'] = new Date(req.body.filter.tsFrom);
    }
    if (req.body.filter.tsTo) {
      if (isDailyPeriod) {
        readingsFilter.ts = readingsFilter.ts || {};
        readingsFilter.ts['$lte'] = new Date(req.body.filter.tsTo);
      } else {
        readingsFilter.tst = {};
        readingsFilter.tst['$lte'] = new Date(req.body.filter.tsTo);
      }
    }
    if (req.body.filter.plants && req.body.filter.plants.length) {
      Object.assign(getPlantIdsFilter, {
        _id: { '$in': req.body.filter.plants }
      })
    }
    if (req.body.filter.projects && req.body.filter.projects.length) {
      Object.assign(getPlantIdsFilter, {
        'project.id': { '$in': req.body.filter.projects }
      })
    }
    if (req.body.filter['plants-status'] && req.body.filter['plants-status'].length) {
      plantsStatusFilter = {
        'monitor.status': { '$in': req.body.filter['plants-status'] }
      }
    }
    if (req.body.filter.villages && req.body.filter.villages.length) {
      locationsFilter = {
        'village._id': { '$in': req.body.filter.villages.map(idAsString => new mongoose.Types.ObjectId(idAsString)) }
      }
    }
    if (req.body.filter.countries && req.body.filter.countries.length) {
      if (!locationsFilter) {
        locationsFilter = {}
      }
      Object.assign(locationsFilter, {
        'village.country': { '$in': req.body.filter.countries }
      })
    }
  }

  const project = {
    project: 1,
    village: 1,
    'monitor.status': 1,
  };
  
  let aggregation = Plant.aggregate()
    .match(getPlantIdsFilter)
    .lookup({
      from: 'plants-status',
      localField: '_id',
      foreignField: '_id',
      as: 'monitor'
    })
    .unwind('$monitor')
    .project(project);

  if (plantsStatusFilter) {
    aggregation = aggregation.match(plantsStatusFilter);
  }

  {
    const projectFields = Object.getOwnPropertyNames(project);
    for (var i = 0; i < projectFields.length; i++) {
      delete project[projectFields[i]];
    }
  }
  project._id = 1

  aggregation = aggregation
    .lookup({
      from: 'villages',
      localField: 'village',
      foreignField: '_id',
      as: 'village'
    })
    .unwind('$village');

  if (locationsFilter) {
    aggregation = aggregation.match(locationsFilter);
  }
  aggregation = aggregation.project(project);
  aggregation = aggregation.allowDiskUse(true);

  aggregation.exec()
  .then(readResult => {
    if (!readResult.length) {
      WellKnownJsonRes.okMulti(res);
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
      Object.assign(readingsFilter, {
        '$or': readingsPlantIdsOrList
      });
    }

    // perform actual aggregation
    //
    const schema = require(`../../api/schemas/readings/gen-reading-${req.params.period}-log`);
    const GenReadingDaily = require('../middleware/mongoose-db-conn').driverDBConnRegistry
      .get('mcl')
      .model(`GenReading${req.params.period.charAt(0).toUpperCase() + req.params.period.slice(1)}`, schema);
    aggregation = GenReadingDaily.aggregate()
      .match(readingsFilter)
      .group(isDailyPeriod
        ? {
            _id: '$d',
            ts : { '$first': '$ts' }, 
            'batt-t-in': { '$avg': '$batt-t-in' },
            'e-delivered': { '$sum': '$e-delivered' },
            'e-self-cons': { '$sum': '$e-self-cons' },
            'sens-irrad': { '$avg': '$sens-irrad' },
            'sens-t-in': { '$avg': '$sens-t-in' },
            'sens-t-mod': { '$avg': '$sens-t-mod' },
            'sens-t-out': { '$avg': '$sens-t-out' },
        }
        : {
            _id: {
                b: '$d',
                e: '$dt'
            },
            'tsf' : { $first: '$ts' }, 
            'tst' : { $first: '$tst' }, 
            'batt-t-in': { '$avg': '$batt-t-in' },
            'e-delivered': { '$sum': '$e-delivered' },
            'e-self-cons': { '$sum': '$e-self-cons' },
            'sens-irrad': { '$avg': '$sens-irrad' },
            'sens-t-in': { '$avg': '$sens-t-in' },
            'sens-t-mod': { '$avg': '$sens-t-mod' },
            'sens-t-out': { '$avg': '$sens-t-out' },
        });

    if (JsonObjectHelper.isNotEmpty(req._q.sort)) {
      aggregation = aggregation.sort(req._q.sort);
    }  

    if (JsonObjectHelper.isNotEmpty(req._q.proj)) {
      aggregation = aggregation.project(req._q.proj);
    }

    BasicRead.aggregate(req, res, next, GenReadingDaily, aggregation, req._q.skip, req._q.limit);
  })
  .catch(readError => {
    WellKnownJsonRes.errorDebug(res, readError);
  });
};

// cRud/aggregateForSoldTotalizers
exports.aggregate_for_sold_totalizers = (req, res, next) => {
  const isDailyPeriod = req.params.period === 'daily';
  const readingsFilter = {
  };
  const getPlantIdsFilter = {
    enabled: true
  };
  let plantsStatusFilter = undefined;
  let locationsFilter = undefined;

  // retrieve totalizers filter: plant ids + date range
  //
  if (req.body.filter) {
    if (req.body.filter.tsFrom) {
      readingsFilter.ts = readingsFilter.ts || {};
      readingsFilter.ts['$gte'] = new Date(req.body.filter.tsFrom);
    }
    if (req.body.filter.tsTo) {
      if (isDailyPeriod) {
        readingsFilter.ts = readingsFilter.ts || {};
        readingsFilter.ts['$lte'] = new Date(req.body.filter.tsTo);
      } else {
        readingsFilter.tst = {};
        readingsFilter.tst['$lte'] = new Date(req.body.filter.tsTo);
      }
    }
    if (req.body.filter.plants && req.body.filter.plants.length) {
      Object.assign(getPlantIdsFilter, {
        _id: { '$in': req.body.filter.plants }
      })
    }
    if (req.body.filter.projects && req.body.filter.projects.length) {
      Object.assign(getPlantIdsFilter, {
        'project.id': { '$in': req.body.filter.projects }
      })
    }
    if (req.body.filter['plants-status'] && req.body.filter['plants-status'].length) {
      plantsStatusFilter = {
        'monitor.status': { '$in': req.body.filter['plants-status'] }
      }
    }
    if (req.body.filter.villages && req.body.filter.villages.length) {
      locationsFilter = {
        'village._id': { '$in': req.body.filter.villages.map(idAsString => new mongoose.Types.ObjectId(idAsString)) }
      }
    }
    if (req.body.filter.countries && req.body.filter.countries.length) {
      if (!locationsFilter) {
        locationsFilter = {}
      }
      Object.assign(locationsFilter, {
        'village.country': { '$in': req.body.filter.countries }
      })
    }
  }

  const project = {
    project: 1,
    village: 1,
    'monitor.status': 1,
  };
  
  let aggregation = Plant.aggregate()
    .match(getPlantIdsFilter)
    .lookup({
      from: 'plants-status',
      localField: '_id',
      foreignField: '_id',
      as: 'monitor'
    })
    .unwind('$monitor')
    .project(project);

  if (plantsStatusFilter) {
    aggregation = aggregation.match(plantsStatusFilter);
  }

  {
    const projectFields = Object.getOwnPropertyNames(project);
    for (var i = 0; i < projectFields.length; i++) {
      delete project[projectFields[i]];
    }
  }
  project._id = 1

  aggregation = aggregation
    .lookup({
      from: 'villages',
      localField: 'village',
      foreignField: '_id',
      as: 'village'
    })
    .unwind('$village');

  if (locationsFilter) {
    aggregation = aggregation.match(locationsFilter);
  }
  aggregation = aggregation.project(project);
  aggregation = aggregation.allowDiskUse(true);

  aggregation.exec()
  .then(readResult => {
    if (!readResult.length) {
      WellKnownJsonRes.okMulti(res);
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
      Object.assign(readingsFilter, {
        '$or': readingsPlantIdsOrList
      });
    }

    // perform actual aggregation
    //
    const schema = require(`../../api/schemas/readings/meter-reading-${req.params.period}-log`);
    const MeterReadingDaily = require('../middleware/mongoose-db-conn').driverDBConnRegistry
      .get('spm')
      .model(`MeterReading${req.params.period.charAt(0).toUpperCase() + req.params.period.slice(1)}`, schema);
    aggregation = MeterReadingDaily.aggregate()
      .match(readingsFilter)
      .group(isDailyPeriod
        ? {
            _id: '$d',
            ts : { '$first': '$ts' }, 
            'e-sold-kwh' : { '$sum': '$e-sold-kwh' }, 
            'e-sold-target-ccy' : { '$sum': '$e-sold-target-ccy' }, 
        }
        : {
            _id: {
                b: '$d',
                e: '$dt'
            },
            'tsf' : { $first: '$ts' }, 
            'tst' : { $first: '$tst' }, 
            'e-sold-kwh' : { $sum: '$e-sold-kwh' }, 
            'e-sold-target-ccy' : { $sum: '$e-sold-target-ccy' }, 
        });

    if (JsonObjectHelper.isNotEmpty(req._q.sort)) {
      aggregation = aggregation.sort(req._q.sort);
    }  

    if (JsonObjectHelper.isNotEmpty(req._q.proj)) {
      aggregation = aggregation.project(req._q.proj);
    }

    BasicRead.aggregate(req, res, next, MeterReadingDaily, aggregation, req._q.skip, req._q.limit);
  })
  .catch(readError => {
    WellKnownJsonRes.errorDebug(res, readError);
  });
};

// cRud/aggregateForPlant
exports.aggregate_for_plant = (req, res, next) => {
  const plantFilter = {
    enabled: true
  }

  if (req.body.filter && req.body.filter.plant) {
    Object.assign(plantFilter, {
      _id: req.body.filter.plant
    })
  }

  const project = {
    name: 1,
    project: 1,
    geo: 1,
    village: 1,
    dates: 1,
    setup: 1,
    tariffs: 1,
    'add-ons': 1,
    stats: 1,
    organization: 1,
    'monitor.status': 1,
    'monitor.messages': 1
  };
  
  let aggregation = Plant.aggregate()
    .match(plantFilter)
    .lookup({
      from: 'plants-status',
      localField: '_id',
      foreignField: '_id',
      as: 'monitor'
    })
    .unwind('$monitor')
    .project(project);

  delete project.village;
  delete project.organization;
  Object.assign(project, {
    'village._id': 1,
    'village.name': 1,
    'village.geo': 1,
    // 'village.country': 1
    'village.country._id': 1,
    'village.country.default-name': 1,
    'village.country.aplha-3-code': 1,
    'village.country.numeric-code': 1,
    'parts.qty': 1,
    'parts.info': 1,
    'parts.part.category': 1,
    'parts.part.label': 1,
    'parts.part.hw': 1,
    'parts.part.doc': 1,
    'organization.office': 1,
    'organization.customer-contacts': 1,
    'organization.agents._id': 1,
    'organization.agents.fullName': 1,
    'organization.agents.contacts': 1,
    'organization.om-managers': 1,
    'organization.representatives._id': 1,
    'organization.representatives.fullName': 1,
    'organization.representatives.contacts': 1,
  });

  aggregation = aggregation
    .lookup({
      from: 'villages',
      localField: 'village',
      foreignField: '_id',
      as: 'village'
    })
    .unwind('$village')
    .lookup({
      from: 'countries',
      localField: 'village.country',
      foreignField: '_id',
      as: 'village.country'
    })
    .unwind('$village.country')
    .lookup({
      from: 'plants-parts',
      localField: '_id',
      foreignField: 'plant',
      as: 'parts'
    })
    .lookup({
      from: 'agents',
      localField: 'organization.agents',
      foreignField: '_id',
      as: 'organization.agents'
    })
    .lookup({
      from: 'representatives',
      localField: 'organization.representatives',
      foreignField: '_id',
      as: 'organization.representatives'
    })
    ;

  if (JsonObjectHelper.isNotEmpty(req._q.sort)) {
    aggregation = aggregation.sort(req._q.sort);
  }
  
  aggregation = aggregation.project(project);

  if (JsonObjectHelper.isNotEmpty(req._q.proj)) {
    aggregation = aggregation.project(req._q.proj);
  }

  aggregation = aggregation.allowDiskUse(true);

  BasicRead.aggregate(req, res, next, Plant, aggregation, req._q.skip, req._q.limit);
};

// cRud/aggregateForFinancial
exports.aggregate_for_financial = (req, res, next) => {
  {
    const missingParams = new Set();
    if (!req.body.filter) {
      missingParams.add('filter');
    } else {
      if (!req.body.filter['driver']) {
        missingParams.add('driver');
      }
      if (!req.body.filter['plant']) {
        missingParams.add('plant');
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
  const mongooseDbConn = require('../middleware/mongoose-db-conn');
  const driverDbKey = req.body.filter['driver'];
  const schemaFinancialPerformanceOnPeriod = require(`../schemas/kpi/financial-forecast-${req.params.period}`);
  const FinancialPerformanceOnPeriod = mongooseDbConn.driverDBConnRegistry
    .get(driverDbKey)
    .model(`FinancialPerformance${req.params.period.charAt(0).toUpperCase() + req.params.period.slice(1)}`, schemaFinancialPerformanceOnPeriod);

  if (!req._q.sort.length) {
    req._q.sort = {
      ts: 1
    }
  }

  BasicRead.all(req, res, next, FinancialPerformanceOnPeriod, finPerformanceFilter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// Crud
exports.create = (req, res, next) => {
  VillageCtrl.village_exists_by_id(req.body.village)
    .then(() => exports.generate_plant_id(req.body))
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
exports.plant_exists_by_id = plantId => {
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

// other/generatePlantId
exports.generate_plant_id = (target = { project: {} }) => {
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
        resolve(`|${target.project.id}|${target.project.code}|${countResult+1}|`)
      })
      .catch(countError => {
        reject(countError);
      });
  });
}
