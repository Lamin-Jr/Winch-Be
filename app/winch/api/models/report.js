const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
  _id: String,
  handler: {
    type: Object,
    properties: {
      name: {
        type: String,
        required: true,
      },
      params: {
        type: Object,
      },  
    },
    required: true,
  },
  notifications: {
    type: Array,
    items: {
      type: Object,
      properties: {
        channel: {
          type: String,
          required: true,
        },
        address: {
          type: Object,
          required: true,
        }
      },
    },
  },
}, { 
  collection: 'reports',
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Report', reportSchema);


module.exports = model;
