const mongoose = require('mongoose');
const geojson = require('mongoose-geojson-schema');

const AddressComponentSchema = require('./addressComponent');

const addressSchema = mongoose.Schema({
  formattedAddress: {
    type: String,
    required: true
  },
  geo: mongoose.Schema.Types.Point,
  addressComponents: {
    type: [AddressComponentSchema],
    default: null
  }
}, {
  _id: false
});

module.exports = addressSchema;
