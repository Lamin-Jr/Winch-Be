const mongoose = require('mongoose');

const genReadingConfSchema = mongoose.Schema({
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
  collection: 'conf',
});


module.exports = genReadingConfSchema;
