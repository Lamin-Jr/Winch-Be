const mongoose = require('mongoose');

const Customer = require('../models/customer');

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
  BasicRead.all(req, res, next, Customer, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnDefaultName
exports.autocomplete = (req, res, next) => {
  // TODO
  // BasicRead.autocomplete(req, res, next, Customer, 'fullName', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/aggregateForCustomer
exports.aggregate_for_customer = (req, res, next) => {
  const plantsFilter = {
  }

  let plantsStatusFilter = undefined;
  let locationsFilter = undefined;

  if (req.body.filter) {
    if (req.body.filter.plants && req.body.filter.plants.length) {
      Object.assign(plantsFilter, {
        plant: { '$in': req.body.filter.plants }
      })
    }
    if (req.body.filter.projects && req.body.filter.projects.length) {
      Object.assign(plantsFilter, {
        'plant.project.id': { '$in': req.body.filter.projects }
      })
    }
    if (req.body.filter['plants-status'] && req.body.filter['plants-status'].length) {
      plantsStatusFilter = {
        'plant.monitor.status': { '$in': req.body.filter['plants-status'] }
      }
    }
    if (req.body.filter.villages && req.body.filter.villages.length) {
      locationsFilter = {
        'plant.village._id': { '$in': req.body.filter.villages.map(idAsString => new mongoose.Types.ObjectId(idAsString)) }
      }
    }
    if (req.body.filter.countries && req.body.filter.countries.length) {
      if (!locationsFilter) {
        locationsFilter = {}
      }

      Object.assign(locationsFilter, {
        'plant.village.country._id': { '$in': req.body.filter.countries }
      })
    }
  }

  const project = {
    _id: 1,
    customerType: 1,
    fullName: 1,
    contacts: 1,
    stats: 1,
    driver: 1,
    'plant._id': 1, 
    'plant.name': 1, 
    'plant.project': 1, 
    'plant.village': 1, 
    'plant.stats': 1, 
    'plant.monitor.status': 1,
    'meter': 1,
  };

  let aggregation = Customer.aggregate()
    .match(plantsFilter)
    .lookup({
      from: 'plants',
      localField: 'plant',
      foreignField: '_id',
      as: 'plant'
    })
    .unwind('$plant')
    .lookup({
      from: 'plants-status',
      localField: 'plant._id',
      foreignField: '_id',
      as: 'plant.monitor'
    })
    .unwind('$plant.monitor')
    .project(project)
    ;

  if (plantsStatusFilter) {
    aggregation = aggregation.match(plantsStatusFilter);
  }

  delete project['plant.village'];
  delete project['meter'];
  Object.assign(project, {
    'plant.village._id': 1,
    'plant.village.name': 1,
    'plant.village.country._id': 1,
    'plant.village.country.default-name': 1,
    'meter._id': 1, 
    'meter.hw.serial-no': 1,
  });

  aggregation = aggregation
    .lookup({
      from: 'villages',
      localField: 'plant.village',
      foreignField: '_id',
      as: 'plant.village'
    })
    .unwind('$plant.village')
    .lookup({
      from: 'countries',
      localField: 'plant.village.country',
      foreignField: '_id',
      as: 'plant.village.country'
    })
    .unwind('$plant.village.country')
    .lookup({
      from: 'meters',
      localField: 'meter',
      foreignField: '_id',
      as: 'meter'
    })
    .unwind('$meter')
  ;

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

  BasicRead.aggregate(req, res, next, Customer, aggregation, req._q.skip, req._q.limit);
};

// Crud
exports.create = (req, res, next) => {
  // TODO
  // const customer = new Customer({
  // });

  // BasicWrite.create(req, res, next, customer);
};


//
// utils

// cRud/existsById
exports.customer_exists_by_id = (customerId) => {
  return new Promise((resolve, reject) => {
    Customer.countDocuments({ _id: customerId }).exec()
    .then(countResult => {
      countResult === 0
        ? reject(new Error(`customer '${customerId}' does not exist`))
        : resolve();
    })
    .catch(countError => {
      reject(countError)
    })
  });
}
