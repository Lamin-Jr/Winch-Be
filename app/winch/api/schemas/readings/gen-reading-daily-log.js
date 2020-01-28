const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const genReadingDailyLogSchema = mongoose.Schema({
  _id: String,
  d: String,
  ts: Date,
  'batt-t-in': Double,
  'e-delivered': Double,
  'e-self-cons': Double,
  'sens-irrad': Double,
  'sens-t-in': Double,
  'sens-t-mod': Double,
  'sens-t-out': Double,
},
{
  collection: 'device-readings-daily'
});

module.exports = genReadingDailyLogSchema;
