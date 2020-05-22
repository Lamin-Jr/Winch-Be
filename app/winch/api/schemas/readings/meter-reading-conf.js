const mongoose = require('mongoose');

const meterReadingConfSchema = mongoose.Schema({
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
    tz: String,
    ccy: String,
  }
}, { 
  collection: 'conf',
});


module.exports = meterReadingConfSchema;
