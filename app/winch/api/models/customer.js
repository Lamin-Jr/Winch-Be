const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')
const Double = require('@mongoosejs/double') // [GP] 
const Tariff = require('./tariff')

const customerSchema = mongoose.Schema({
  _id: String,
  ...mongooseMixins.fullCrudActors,
  enabled: Boolean,
  customerType: String,
  ...mongooseMixins.makePersonModel(),
  fullName: { 
    type: String,
    required: true
  },
  geo: mongoose.Schema.Types.FeatureCollection,
  tariff: Tariff,
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
    type: String
  },
  meter: String
}, { 
  collection: 'customers',
  ...mongooseMixins.fullCrudActorsTs,
});

customerSchema.index({
  meter: 1
}, {
  name: 'meter-asc',
  background: true
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Customer', customerSchema);


module.exports = model;
