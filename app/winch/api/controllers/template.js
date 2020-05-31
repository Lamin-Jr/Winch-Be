const mongoose = require('mongoose');

const Template = require('../models/template');

// const { 
  // JsonObjectTypes,
  // JsonObjectHelper, 
// } = require('../../../../api/lib/util/json-util');
// const {
  // WellKnownJsonRes,
  // JsonResWriter,
// } = require('../../../../api/middleware/json-response-util');
const { 
  BasicRead,
  // BasicWrite,
} = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Template, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};


//
// utils

// // cRud/existsById
// exports.template_exists_by_id = (templateId) => {
//   return new Promise((resolve, reject) => {
//     Template.countDocuments({ _id: templateId }).exec()
//     .then(countResult => {
//       countResult === 0
//         ? reject(new Error(`template '${templateId}' does not exist`))
//         : resolve();
//     })
//     .catch(countError => {
//       reject(countError)
//     })
//   });
// }
