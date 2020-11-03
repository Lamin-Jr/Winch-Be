const mongoose = require('mongoose');

const Plant = require('../../models/plant');

const {
  // JsonObjectTypes,
  JsonObjectHelper,
} = require('../../../../../api/lib/util/json-util');
// const {
//   WellKnownJsonRes,
//   // JsonResWriter,
// } = require('../../../../../api/middleware/json-response-util');
const {
  BasicRead,
  // BasicWrite,
} = require('../../../../../api/middleware/crud');
// const mongooseMixins = require('../../../../../api/middleware/mongoose-mixins');

const {
  buildPlantFilters
} = require('./_shared')


//
// endpoint-related

// cRud/list
exports.list = (req, res, next) => {
  const plantFilters = buildPlantFilters(req.body.filter);

  const project = {
    name: 1,
    dates: 1,
    project: 1,
    geo: 1,
    village: 1,
    setup: 1,
    stats: 1,
    'monitor.status': 1,
    'monitor.messages': 1
  };

  let aggregation = Plant.aggregate()
    .match(plantFilters.plantsFilter)
    .lookup({
      from: 'plants-status',
      localField: '_id',
      foreignField: '_id',
      as: 'monitor'
    })
    .unwind('$monitor')
    .project(project);

  if (plantFilters.plantsStatusFilter) {
    aggregation = aggregation.match(plantFilters.plantsStatusFilter);
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
    //
    ;

  if (plantFilters.plantsLocationsFilter) {
    aggregation = aggregation.match(plantFilters.plantsLocationsFilter);
  }

  aggregation = aggregation
    .lookup({
      from: 'countries',
      localField: 'village.country',
      foreignField: '_id',
      as: 'village.country'
    })
    .unwind('$village.country')
    //
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

// cRud/detailed
exports.detailed = (req, res, next) => {
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
