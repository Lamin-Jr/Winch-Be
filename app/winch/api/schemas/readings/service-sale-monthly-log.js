const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
const Double = require('@mongoosejs/double');

const {
  plantServiceIdSchema,
} = require('../../models/_shared')

const serviceSaleDailyLogSchema = mongoose.Schema({
  _id: {
    type: Object,
    properties: {
      ...plantServiceIdSchema,
      'op': String,
      'yt': Number, 
      'mt': Number, 
      'n': mongoose.Schema.Types.Long,
    },
  },
  'd': String, 
  'df': String, 
  'dt': String, 
  'ts': Date, 
  'tsf': Date, 
  'tst': Date, 
  'tx-p-c': Number,
  'tx-p-cum': mongoose.Schema.Types.Long,
  'tx-p-lccy': Double,
  'e-cons': Double,
  'e-cons-lccy': Double,
  'r-g-lccy': Double,
  'r-agf-lccy': Double,
  'r-opf-lccy': Double,
  'r-n-lccy': Double,
  'fm-fcst-lccy': Double,
  'fm-fcst-cum-lccy': Double,
  'fm-real-cum-lccy': Double,
  'tccy-er': Double,
}, {
  collection: 'services-sales-daily'
});

module.exports = serviceSaleDailyLogSchema;
