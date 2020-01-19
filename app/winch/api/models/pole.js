const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const poleSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ...mongooseMixins.fullCrudActors,
  enabled: Boolean,
  code: {
    type: String,
    required: true
  },
  geo: {
    type: mongoose.Schema.Types.FeatureCollection
  },
  plant: {
    type: String
  }
}, { 
  collection: 'poles',
  ...mongooseMixins.fullCrudActorsTs,
});

poleSchema.index({
  code: 1
}, {
  name: 'code-asc-uni',
  unique: true,
  background: true
});
poleSchema.index({
  plant: 1
}, {
  name: 'plant-asc',
  background: true
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Pole', poleSchema);


module.exports = model;
