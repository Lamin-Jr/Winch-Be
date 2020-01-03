const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const tariffSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ...mongooseMixins.fullCrudActors,
  ...mongooseMixins.history,
  name: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  validity: Date,
  'conn-fee': {
    cost: Double
  },
  base: {
    flat: {
      cost: {
        type: Double,
        required: true
      },
      amount: {
        type: Double
      },
      unit: {
        type: String,
        required: true
      }
    },
    scheduled: [{
      from: {
        type: String,
        required: true
      },
      to: {
        type: String,
        required: true
      },
      cost: {
        type: Double,
        required: true
      },
      amount: {
        type: Double
      },
      unit: {
        type: String,
        required: true
      }
    }],
    volumes: [{
      from: {
        type: Double,
        required: true
      },
      to: {
        type: Double,
        required: true
      },
      factor: {
        type: Double,
        required: true
      }
    }]
  },
  'standing-charge': {
    cost: {
      type: Double,
      required: true
    },
    amount: {
      type: Double
    },
    unit: {
      type: String,
      required: true
    },
    'allow-overbooking': Boolean,
    'cycle-start': Number
  },
  'limit': {
    e: {
      daily: Double
    },
    p: {
      flat: {
        max: Double
      },
      scheduled: [{
        from: {
          type: String,
          required: true
        },
        to: {
          type: String,
          required: true
        },
        max: Double
      }]
    }
  },
  plant: String
}, { 
  collection: 'tariffs',
  ...mongooseMixins.fullCrudActorsTs
});

const model = require('../middleware/mongoose').model('Tariff', tariffSchema);


module.exports = model;
