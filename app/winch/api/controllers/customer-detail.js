// [GP]

const mongoose = require('mongoose');

const Customer = require('../models/customer');
const driverConnection = require('../middleware/mongoose-db-conn').driverDBConnRegistry


const { 
  // JsonObjectTypes,
  JsonObjectHelper, 
} = require('../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const { 
  BasicRead,
  // BasicWrite,
} = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud
exports.aggregate_customer_meter = (req, res, next) => {
  // res.json({data: 'no data'});
  // WellKnownJsonRes.okMulti(res, total = 0, jsonItems = [{test: 'data'}], skip = 0, limit = 0, status = 200)
  if(req.body.filter){
    if (req.body.filter.driver && req.body.filter.driver.length) {

    }
    if (req.body.filter.plants && req.body.filter.plants.length) {
    
    }

    if (req.body.filter.meterid && req.body.filter.meterid.length) {
    
    }

    if (req.body.filter.customerid && req.body.filter.customerid.length) {
  
    }
  }

  driverConnection.get('spm').meter('config');
 // aggregation = MeterReadingDaily.aggregate()
  
 // BasicRead.all(req, res, next, Customer, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
 // BasicRead.aggregate(req, res, next, Customer, aggregation, req._q.skip, req._q.limit);

};

//
// utils

// cRud/existsById
// exports.customer_exists_by_id = (customerId) => {
//   return new Promise((resolve, reject) => {
//     Customer.countDocuments({ _id: customerId }).exec()
//     .then(countResult => {
//       countResult === 0
//         ? reject(new Error(`customer '${customerId}' does not exist`))
//         : resolve();
//     })
//     .catch(countError => {
//       reject(countError)
//     })
//   });
// }
