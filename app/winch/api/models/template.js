const mongoose = require('mongoose');

const templateSchema = mongoose.Schema({
  _id: String,
  body: {
    type: Object,
    required: true,
  },
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
}, { 
  collection: 'templates',
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Template', templateSchema);


module.exports = model;
