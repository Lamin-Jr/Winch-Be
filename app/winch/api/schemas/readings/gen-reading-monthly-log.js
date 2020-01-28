const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const genReadingMonthlyLogSchema = mongoose.Schema({
  _id: String,
  df: String,
  dt: String,
  tsf: Date,
  tst: Date,
  'batt-t-in': Double,
  'e-delivered': Double,
  'e-self-cons': Double,
  'sens-irrad': Double,
  'sens-t-in': Double,
  'sens-t-mod': Double,
  'sens-t-out': Double,
},
{
  collection: 'device-readings-monthly'
});


module.exports = genReadingMonthlyLogSchema;
