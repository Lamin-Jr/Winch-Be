const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins');

const transactionUserSchema = mongoose.Schema({
  _id: {
    type: Object,
    properties: {
      m: {
        type: String,
        required: true,
      },
      mRef: {
        type: String,
        required: true,
      },
      ms: {
        type: String,
        required: true,
      },
      cid: {
        type: String,
        required: true,
      },
    }
  },
  ...mongooseMixins.fullCrudActors,
  pin: {
    type: String,
    required: true,
  },
  msRef: {
    type: String,
    required: true,
  },
  cidRef: {
    type: String,
    required: true,
  },
  contacts: {
    type: Array,
    items: {
      type: Object,
      properties: mongooseMixins.makeContactModel(),
    },
  },
}, {
  collection: 'transactions-users',
  ...mongooseMixins.fullCrudActorsTs,
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('TransactionUser', transactionUserSchema);


module.exports = model;
