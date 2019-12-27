const mongoose = require('mongoose');

const priceSchema = mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  }
}, {
  _id: false
});

module.exports = priceSchema;
