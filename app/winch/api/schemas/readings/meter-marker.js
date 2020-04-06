const mongoose = require('mongoose');

const meterMarkerSchema = mongoose.Schema({
  _id: {
    ms: String,
    mkr: String
  },
  createdAt: Date,
  lastUpdate: Date,
},
{
  collection: 'meter-markers',
  strict: false
});

module.exports = meterMarkerSchema;
