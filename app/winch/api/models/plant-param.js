const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const plantParamSchema = mongoose.Schema({
  _id: String,
  degradation: {
    default: {
      type: Array,
      items: {
        type: String
      }
    },
    yearly: Object,
    monthly: Object,
    weekly: Object,
    daily: Object,
    expr: String
  },
  eafs: {
    type: Array,
    items: {
      type: Double
    },
    minItems: 12,
    maxItems: 12,
  },
  pr: {
    type: Array,
    items: {
      type: Double
    },
    minItems: 12,
    maxItems: 12
  },
  'ramp-up': {
    type: Array,
    items: {
      type: Double
    }
  }
}, { 
  collection: 'plants-param'
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('PlantParam', plantParamSchema);


module.exports = model;
