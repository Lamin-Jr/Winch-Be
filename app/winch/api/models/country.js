const mongoose = require('mongoose');

const countrySchema = mongoose.Schema({
  _id: String, // aplha-2-code
  'default-name': {
    type: String,
    required: true,
    unique: true
  },
  'aplha-3-code': {
    type: String,
    required: true,
    unique: true
  },
  'numeric-code': {
    type: Number,
    required: true,
    unique: true
  }
}, { 
  collection: 'countries'
});

const model = require('../middleware/mongoose').model('Country', countrySchema);


module.exports = model;
