const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
const Double = require('@mongoosejs/double');

const customerDailyLogSchema = mongoose.Schema({
  _id: {
    type: Object,
    properties: {
      'm': String, 
      'ms': String, 
      'yt': Number, 
      'mt': Number, 
      'dt': Number, 
      'c': String, 
      'n': mongoose.Schema.Types.Long,
    },
  }, 
  'avc': Number, 
  'b-lccy': Double, 
  'b-tccy': Double, 
  'ct' : String, 
  'd': String, 
  'es': Double, 
  'r-es-lccy': Double, 
  'r-es-tccy': Double, 
  'ts': Date, 
  'tx-es-c': Number, 
  'tx-es-lccy': Double, 
  'tx-es-tccy': Double, 
}, {
  collection: 'customers-daily'
});

module.exports = customerDailyLogSchema;
