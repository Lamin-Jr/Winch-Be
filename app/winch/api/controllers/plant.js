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
    if (req.body.filter.plants && req.body.filter.plants.length > 0) {
      Object.assign(plantsFilter, {
        _id: { '$in': req.body.filter.plants }
      })
    }
    if (req.body.filter.projects && req.body.filter.projects.length > 0) {
      Object.assign(plantsFilter, {
        'project.id': { '$in': req.body.filter.projects }
      })
    }
    if (req.body.filter['plants-status'] && req.body.filter['plants-status'].length > 0) {
      plantsStatusFilter = {
        'monitor.status': { '$in': req.body.filter['plants-status'] }
      }
    }
    if (req.body.filter.villages && req.body.filter.villages.length > 0) {
      locationsFilter = {
        'village._id': { '$in': req.body.filter.villages.map(idAsString => new mongoose.Types.ObjectId(idAsString)) }
      }
    }
    if (req.body.filter.countries && req.body.filter.countries.length > 0) {
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
