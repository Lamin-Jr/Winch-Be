const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const plantElectricityAvailableForSaleSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  plants: {
    type: Array,
    items: {
      type: mongoose.Schema.Types.ObjectId
    },
    required: true
  },
  'degradation-factors': {
    type: Array,
    items: {
      from: {
        type: Number,
        required: true,
        min: 1
      },
      to: {
        type: Number,
        default: undefined,
      },
      value: {
        type: Double,
        required: true,
        min: 0,
        max: 100
      }
    }
  } ,
  'ramp-up': {
    'starting-month': {
      type: Number,
      default: undefined,
    },
    factors: {
      type: Array,
      items: {
        type: Double,
        min: 0.0,
        max: 1.0
      },
      default: []
    }
  },
  eafs: {
    type: Array,
    required: true,
    items: {
      type: Double,
      required: true,
      min: 0,
      max: 100
    },
    validate: [eafsArrayMustHave12Elements, '{PATH} must contain exactly 12 items']
  }
}, { 
  collection: 'plants-eafs'
});

plantElectricityAvailableForSaleSchema.index({
  plants: 1
}, {
  name: 'plants-asc',
  background: true
});

const model = require('../middleware/mongoose').model('PlantElectricityAvailableForSaleSchema', plantElectricityAvailableForSaleSchema);


module.exports = model;

function eafsArrayMustHave12Elements(val) {
  return val.length == 12;
}