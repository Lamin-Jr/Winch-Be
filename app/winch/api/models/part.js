const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const partSchema = mongoose.Schema({
  _id: String,
  category: {
    type: String,
    enum: ['container', 'pv module', 'genset', 'solar inverter', 'battery inverter', 'battery pack', 'meter'],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  hw: {
    manufacturer: {
      type: String,
      required: true
    },
    'model': {
      type: String,
      required: true
    }
  },
  doc: {
    datasheets: {
      type: Array,
      items: {
        label: String,
        link: String
      }
    },
    manuals: {
      type: Array,
      items: {
        label: String,
        link: String
      }
    },
    certs: {
      type: Array,
      items: {
        label: String,
        link: String
      }
    }
  }
}, { 
  collection: 'parts'
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Part', partSchema);


module.exports = model;
