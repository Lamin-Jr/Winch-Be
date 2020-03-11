const mongoose = require('mongoose');

const Agent = require('../models/agent');

const { 
  // JsonObjectTypes,
  JsonObjectHelper, 
} = require('../../../../api/lib/util/json-util');
// const {
  // WellKnownJsonRes,
  // JsonResWriter,
// } = require('../../../../api/middleware/-response-utjsonil');
const { 
  BasicRead,
  // BasicWrite,
} = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Agent, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnFullName
exports.autocomplete = (req, res, next) => {
  BasicRead.autocomplete(req, res, next, Agent, 'fullName', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/aggregateForAgent
exports.aggregate_for_agent = (req, res, next) => {
  let hasPlantFilter = false;
  const plantsFilter = {};
  let hasPostPlantLookupFilter = false;
  const postPlantLookupFilter = {};
  let hasLocationsFilter = false;
  const locationsFilter = {};

  if (req.body.filter) {
    if (req.body.filter.plants && req.body.filter.plants.length) {
      hasPlantFilter = true;
      Object.assign(plantsFilter, {
        plants: { '$in': req.body.filter.plants }
      });
    }
    if (req.body.filter.projects && req.body.filter.projects.length) {
      hasPostPlantLookupFilter = true;
      Object.assign(postPlantLookupFilter, {
        'plant.project.id': { '$in': req.body.filter.projects }
      });
    }
    if (req.body.filter['plants-status'] && req.body.filter['plants-status'].length) {
      hasPostPlantLookupFilter = true;
      Object.assign(postPlantLookupFilter, {
        'plant.monitor.status': { '$in': req.body.filter['plants-status'] }
      });
    }
    if (req.body.filter.villages && req.body.filter.villages.length) {
      hasLocationsFilter = true;
      Object.assign(locationsFilter, {
        'plant.village._id': { '$in': req.body.filter.villages.map(idAsString => new mongoose.Types.ObjectId(idAsString)) }
      });
    }
    if (req.body.filter.countries && req.body.filter.countries.length) {
      hasLocationsFilter = true;
      Object.assign(locationsFilter, {
        'plant.village.country._id': { '$in': req.body.filter.countries }
      });
    }
  }

  const project = {
    _id: 1,
    fullName: 1,
    contacts: 1,
    'plants._id': 1,
    'plants.name': 1,
    'plants.project': 1,
    'plants.village': 1,
    'plants.monitor.status': 1,
  };

  let aggregation = Agent.aggregate();

  if (hasPlantFilter) {
    aggregation = aggregation.match(plantsFilter);
  }

  aggregation = aggregation
    .lookup({
      from: 'plants',
      localField: 'plants',
      foreignField: '_id',
      as: 'plants'
    })
    .unwind('$plants')
    .lookup({
      from: 'plants-status',
      localField: 'plants._id',
      foreignField: '_id',
      as: 'plants.monitor'
    })
    .unwind('$plants.monitor')
    .project(project)
  ;

  if (hasPostPlantLookupFilter) {
      aggregation = aggregation.match(postPlantLookupFilter);
  }

  delete project['plants.village'];
  Object.assign(project, {
    'plants.village._id': 1,
    'plants.village.name': 1,
    'plants.village.country._id': 1,
    'plants.village.country.default-name': 1,
  });

  aggregation = aggregation
    .lookup({
      from: 'villages',
      localField: 'plants.village',
      foreignField: '_id',
      as: 'plants.village'
    })
    .unwind('$plants.village')
    .lookup({
      from: 'countries',
      localField: 'plants.village.country',
      foreignField: '_id',
      as: 'plants.village.country'
    })
    .unwind('$plants.village.country')
  ;

  if (hasLocationsFilter) {
    aggregation = aggregation.match(locationsFilter);
  }

  aggregation = aggregation.group({
    _id: '$_id',
    fullName: { $first: '$fullName' },
    contacts: { $first: '$contacts' },
    plants: { $push: '$plants' }
  });

  if (JsonObjectHelper.isNotEmpty(req._q.sort)) {
    aggregation = aggregation.sort(req._q.sort);
  }

  aggregation = aggregation.project(project);

  if (JsonObjectHelper.isNotEmpty(req._q.proj)) {
    aggregation = aggregation.project(req._q.proj);
  }

  aggregation = aggregation.allowDiskUse(true);

  BasicRead.aggregate(req, res, next, Agent, aggregation, req._q.skip, req._q.limit);
};


//
// utils
