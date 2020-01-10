const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const plantPerformanceRatioSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  plants: {
    type: Array,
    items: {
      type: mongoose.Schema.Types.ObjectId
    },
    required: true
  },
  'year-progression': {
    type: Number,
    min: -1
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  pr: {
    type: Double,
    required: true,
    min: 0,
    max: 100
  }
}, { 
  collection: 'plants-pr'
});

plantPerformanceRatioSchema.index({
  plants: 1,
  month: 1
}, {
  name: 'plants-month-asc',
  background: true
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('PlantPerformanceRatio', plantPerformanceRatioSchema);


module.exports = model;
