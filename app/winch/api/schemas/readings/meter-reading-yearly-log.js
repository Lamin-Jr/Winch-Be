const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const meterReadingYearlyLogSchema = mongoose.Schema({
  _id: String,
  df: String,
  dt: String,
  tsf: Date,
  tst: Date,
  'e-sold-kwh': Double,
  'e-sold-local-currency': Double
},
{
  collection: 'meter-readings-yearly'
});


module.exports = meterReadingYearlyLogSchema;
