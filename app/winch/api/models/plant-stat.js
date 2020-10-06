const mongoose = require('mongoose');

const { 
  plantStatIdSchema, 
} = require('./shared/plant');

const plantStatSchema = mongoose.Schema({
  _id: plantStatIdSchema,
  value: {
    type: Object,
    required: true
  },
}, { 
  collection: 'plants-stats',
  ...mongooseMixins.fullCrudActorsTs,
});

plantStatSchema.index({
  name: 1
}, {
  name: 'name-asc',
  background: true
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('PlantStat', plantStatSchema);


module.exports = model;
