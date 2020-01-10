const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const plantStatusSchema = mongoose.Schema({
  _id: String,
  ...mongooseMixins.fullCrudActors,
  status: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  messages: {
    type: Array,
    items: {
      type: String
    },
    default: undefined
  }
}, { 
  collection: 'plants-status',
  ...mongooseMixins.fullCrudActorsTs,
});

plantStatusSchema.index({
  status: 1,
}, {
  name: 'status-asc',
  background: true
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('PlantStatus', plantStatusSchema);


module.exports = model;
