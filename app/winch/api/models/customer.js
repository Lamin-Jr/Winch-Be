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
  geo: mongoose.Schema.Types.FeatureCollection,
  meter: String,  // [GP] BEFORE mongoose.Schema.Types.ObjectId
  tariff: [Tariff], // [GP] BEFORE Tariff 
  'next-tariff': {
    _id: mongoose.Schema.Types.ObjectId,
    from: Date
  },
  stats: {
    'startup-ts': Date,
    'total-people-served': Number,
    'startup-read': Double
  }
}, { 
  collection: 'customers',
  ...mongooseMixins.fullCrudActorsTs,
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Customer', customerSchema);


module.exports = model;
