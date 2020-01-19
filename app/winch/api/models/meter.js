const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const meterSchema = mongoose.Schema({
  _id: {
    type: String,
    match: /\|v[A-Z]{3}\|s[^\|]+\|/
  },
  ...mongooseMixins.fullCrudActors,
  label: {
    type: String,
    required: true
  },
  phase: Number,
  hw: {
    manufacturer: {
      type: String
    },
    model: {
      type: String
    },
    'serial-no': {
      type: String,
      required: true
    }
  },
  origin: Object,
  driver: {
    type: String,
    required: true
  },
  plant: {
    type: String
  },
  customer: {
    type: String
  },
  pole: {
    type: mongoose.Schema.Types.ObjectId
  }
}, { 
  collection: 'meters',
  ...mongooseMixins.fullCrudActorsTs
});

meterSchema.index({
  'hw.serial-no': 1
}, {
  name: 'hw-serial-no-asc',
  background: true
});
meterSchema.index({
  plant: 1
}, {
  name: 'plant-asc',
  background: true
});
meterSchema.index({
  'customer': 1
}, {
  name: 'customer-asc',
  background: true
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Meter', meterSchema);


module.exports = model;
