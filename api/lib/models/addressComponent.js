const mongoose = require('mongoose');

const addressComponentSchema = mongoose.Schema({
  longName: {
    type: String,
    required: true
  },
  shortName: {
    type: String,
    required: true
  },
  types: {
    type: [String],
    required: true
  }
}, {
  _id: false
});

module.exports = addressComponentSchema;
