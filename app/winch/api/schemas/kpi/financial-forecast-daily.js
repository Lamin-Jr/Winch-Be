const mongoose = require('mongoose');

const financialForecastDailySchema = mongoose.Schema({
  _id: String,
  db: {
    name: String
  },
  enabled: Boolean,
  plant: {
    comActStart: Date,
    id: String
  },
  site: {
    host: String,
    tz: String
  }
}, { 
  collection: 'financial-forecast-daily',
});


module.exports = financialForecastDailySchema;
