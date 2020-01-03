const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const meterSchema = mongoose.Schema({
  _id: String,
  ...mongooseMixins.fullCrudActors,
  phase: Number,
  label: {
    type: String,
    required: true
  },
  'hw': {
    manufacturer: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    'serial-no': {
      type: String,
      required: true
    }
  },
  plant: {
    type: String,
    required: true
  },
  pole: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, { 
  collection: 'meters',
  ...mongooseMixins.fullCrudActorsTs
});

meterSchema.index({
  'plant': 1
}, {
  name: 'plant-asc',
  background: true
});

const model = require('../middleware/mongoose').model('Meter', meterSchema);


module.exports = model;
