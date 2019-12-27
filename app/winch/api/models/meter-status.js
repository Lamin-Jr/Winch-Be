const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const meterStatusSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  meter: mongoose.Schema.Types.ObjectId,
  active: {
    type: Boolean,
    required: true    
  },
  status: {
    type: String,
    enum: ['on', 'off', 'auto'],
    required: true
  },
  messages: {
    type: Array,
    items: {
      type: String
    },
    default: undefined
  },
  accounting: {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    tariff: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      payment: {
        last: Date,
        next: Date
      }
    },
    balance: {
      amount: {
        type: Double,
        required: true
      },
      currency:{
        type: String,
        required: true
      }
    },
  },
  stats: {
    'last-reboot': {
      type: Date,
      default: undefined
    },
    'last-reading':{
      type: Date,
      default: undefined
    },
    'last-sync-duration': {
      value: {
        type: Number,
        default: undefined
      },
      unit: {
        type: String,
        default: undefined
      }
    }
  }
}, { 
  collection: 'meters-status',
  timestamps: { createdAt: 'ts-creation', updatedAt: 'ts-last-update' }
});

meterStatusSchema.index({
  meter: 1,
}, {
  name: 'meter-asc',
  background: true
});
meterStatusSchema.index({
  current: 1,
}, {
  name: 'current-asc',
  background: true
});
meterStatusSchema.index({
  status: 1,
}, {
  name: 'status-asc',
  background: true
});

const model = require('../middleware/mongoose').model('MeterStatus', meterStatusSchema);


module.exports = model;
