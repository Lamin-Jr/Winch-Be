const mongoose = require('mongoose');

const { 
  plantServiceIdSchema, 
} = require('./shared/plant');

const plantServiceSchema = mongoose.Schema({
  _id: plantServiceIdSchema,
  headTag: {
    type: String,
    required: true,
  },
  headItem: String,
  dates: {
    commit: Date,
    business: Date,
  },
  driver: String,
}, {
  collection: 'plants-services',
});

plantServiceSchema.index({
  name: 1
}, {
  name: 'name-asc',
  background: true
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('PlantService', plantServiceSchema);


module.exports = model;
