const mongoose = require('mongoose');

const addressSchema = require('../lib/models/address');

const badgeSubSchema = mongoose.Schema({
  title: String,
  firstName: String,
  lastName: String,
  displayName: String,
  birthDay: Date,
  gender: {
    type: String,
    enum: ['M', 'F']
  },
  address: addressSchema
});

const accountDetailSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  badge: badgeSubSchema
});

module.exports = mongoose.model('AccountDetail', accountDetailSchema);
