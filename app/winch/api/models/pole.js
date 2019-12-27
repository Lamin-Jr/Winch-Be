const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const poleSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ...mongooseMixins.fullCrudActors,
  enabled: Boolean,
  code: {
    type: String,
    required: true,
    unique: true
  },
  geo: mongoose.Schema.Types.FeatureCollection
}, { 
  collection: 'poles',
  ...mongooseMixins.fullCrudActorsTs,
});

const model = require('../middleware/mongoose').model('Pole', poleSchema);


module.exports = model;
