const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const customerWeeklyLogSchema = mongoose.Schema({
  _id: {
    type: Object,
    properties: {
      'm': String,
      'ms': String,
      'yt': Number,
      'c': String,
      'n': mongoose.Schema.Types.Long,
    },
  },
  'avc': Number,
  'b-lccy': Double,
  'b-tccy': Double,
  'ct': String,
  'd': String,
  'df': String,
  'dt': String,
  'ep': Double,
  'es': Double,
  'pod': String,
  'r-es-lccy': Double,
  'r-es-tccy': Double,
  'ts': Date,
  'tsf': Date,
  'tst': Date,
  'tx-es-c': Number,
  'tx-es-lccy': Double,
  'tx-es-tccy': Double,
}, {
  collection: 'customers-yearly'
});


module.exports = customerWeeklyLogSchema;
