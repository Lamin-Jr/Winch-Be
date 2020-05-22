const mongoose = require('mongoose');

const meterReadingConfApiSchema = mongoose.Schema({
  _id: String,
  api: {
    site: String,
    token: String
  },
  // db: {
  //   name: String
  // },
  // enabled: Boolean,
  plant: {
  //   comActStart: Date,
    id: String
  },
  site: {
  //   host: String,
  //   tz: String
    ccy: String,
  }
}, { 
  collection: 'conf',
});


module.exports = meterReadingConfApiSchema;
