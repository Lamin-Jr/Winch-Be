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


//
// utils
