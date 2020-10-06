const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
const Double = require('@mongoosejs/double');

const forecastDailySchema = mongoose.Schema({
  _id: {
    type: Object,
    properties: {
      m: String,
      n: mongoose.Schema.Types.Long,
    }
  },
  'd': String,
  'eafs': Double,
  'es-fcst': Double,
  'es-fcst-cum': Double,
  'es-real': Double,
  'es-real-cum': Double,
  'fm-fcst-lccy': Double,
  'fm-fcst-cum-lccy': Double,
  'fm-real-lccy': Double,
  'fm-real-cum-lccy': Double,
  'ramp-up-fctr': Double,
  'tccy-er': Double,
  'ts': Date,
}, {
  collection: 'forecasts-daily',
});


module.exports = forecastDailySchema;
