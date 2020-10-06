const mongoose = require('mongoose');
const Double = require('@mongoosejs/double')

const {
  plantServiceIdSchema,
  plantServiceTariffIdSchema,
} = require('../../models/shared/plant')


const serviceSaleLogSchema = mongoose.Schema({
  _id: {
    type: Object,
    properties: {
      ...plantServiceIdSchema,
      tx: {
        type: String,
        required: true
      }
    },
  },
  op: {
    type: String,
    required: true
  },
  s: {
    type: String,
    required: true,
  },
  ts: {
    type: Date,
    required: true
  },
  ag: {
    type: String,
    required: true
  },
  q: {
    type: Number,
    required: true
  },
  t: {
    type: Object,
    properties: {
      ...plantServiceTariffIdSchema,
    },
    required: true,
  },
  a: {
    type: Double,
    required: true
  },
  c: {
    type: String,
    required: true
  },
  ptx: String,
}, {
  collection: 'services-sales'
});


module.exports = serviceSaleLogSchema;