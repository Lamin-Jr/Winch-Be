const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const tariffSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ...mongooseMixins.fullCrudActors,
  enabled: Boolean,
  readingsId: {
    type: String,
    required: true
  },
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
      qty: {
        type: Double
      },
      unit: {
        type: Double,
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
      qty: {
        type: Double
      },
      unit: {
        type: Double,
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
    qty: {
      type: Double
    },
    unit: {
      type: String,
      required: true
    },
    timing: {
      'billing-day-of-month': Number,
      'unuse-daily-discount': Double
    }
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
  origin: Object,
  driver: {
    type: String,
    required: true
  },
  plant: String
}, { 
  collection: 'tariffs',
  ...mongooseMixins.fullCrudActorsTs
});

tariffSchema.index({
  'enabled': 1
}, {
  name: 'enabled-asc',
  background: true
});
tariffSchema.index({
  'plant': 1
}, {
  name: 'plant-asc',
  background: true
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Tariff', tariffSchema);


module.exports = model;
