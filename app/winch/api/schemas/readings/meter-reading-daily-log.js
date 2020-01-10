const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const meterReadingDailyLogSchema = mongoose.Schema({
  _id: String,
  d: String,
  ts: Date,
  'e-sold-kwh': Double,
  'e-sold-local-currency': Double,
},
{
  collection: 'meter-readings-daily'
});

module.exports = meterReadingDailyLogSchema;
