const mongoose = require('mongoose');

const Customer = require('../models/customer');

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
