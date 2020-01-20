const mongoose = require('mongoose');
const Double = require('@mongoosejs/double')

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')
const Tariff = require('./tariff')

const customerSchema = mongoose.Schema({
  _id: String,
  ...mongooseMixins.fullCrudActors,
  customerType: String,
  ...mongooseMixins.makePersonModel(),
  fullName: { 
    type: String,
    required: true
  },
  contacts: {
    type: Array,
    items: {
      type: Object,
      properties: mongooseMixins.makeContactModel()
    }
  },
  geo: mongoose.Schema.Types.FeatureCollection,
  tariff: Tariff.schema,
  'next-tariff': {
    _id: mongoose.Schema.Types.ObjectId,
    from: Date
  },
  stats: {
    'startup-ts': Date,
    'total-people-served': Number,
    'startup-read': Double
  },
  origin: Object,
  driver: {
    type: String,
    required: true
  },
  plant: {
    type: String,
    required: true
  },
  meter: String
}, { 
  collection: 'customers',
  ...mongooseMixins.fullCrudActorsTs,
});

customerSchema.index({
  plant: 1
}, {
  name: 'plant-asc',
  background: true
});
customerSchema.index({
  meter: 1
}, {
  name: 'meter-asc',
  background: true
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Customer', customerSchema);


module.exports = model;
