const mongoose = require('mongoose');

const {
  buildPlantServicesDriversSubSchema,
} = require('./shared/plant');

const plantDriverSchema = mongoose.Schema(
  {
    _id: String, // plant id
    'e-gen': {
      type: Array,
      items: {
        type: String,
        minItems: 1,
      },
    },
    'e-deliv': String,
    ...buildPlantServicesDriversSubSchema(),
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
