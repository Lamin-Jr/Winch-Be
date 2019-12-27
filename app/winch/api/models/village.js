const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const villageSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ...mongooseMixins.fullCrudActors,
  enabled: Boolean,
  name: {
    type: String,
    required: true,
    unique: true
  },
  geo: {
    type: mongoose.Schema.Types.FeatureCollection,
    required: true
  },
  country: String
}, { 
  collection: 'villages',
  ...mongooseMixins.fullCrudActorsTs,
});

const model = require('../middleware/mongoose').model('Village', villageSchema);


module.exports = model;
