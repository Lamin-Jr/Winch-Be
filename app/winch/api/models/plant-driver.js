const mongoose = require('mongoose');

const plantDriverSchema = mongoose.Schema(
  {
    _id: String, // plant id
    'gen-drivers': {
      type: Array,
      items: {
        type: String,
        minItems: 1,
      },
      required: true,
    },
    'deliv-driver': {
      type: String,
      required: true,
    },
    accounting: {
      xform: {
        m: {
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
  },
  {
    collection: 'plants-drivers',
  }
);

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('PlantDriver', plantDriverSchema);


module.exports = model;
