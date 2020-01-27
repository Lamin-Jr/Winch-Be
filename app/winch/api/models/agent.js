const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const agentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  fullName: { 
    type: String,
    required: true
  },
  contacts: {
    type: Array,
    items: {
      type: Object,
      properties: mongooseMixins.makeContactModel()
    }
  },
  plant: {
    type: String,
    required: true
  }
}, { 
  collection: 'agents'
});

agentSchema.index({
  plant: 1
}, {
  name: 'plant-asc',
  background: true
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Agent', agentSchema);


module.exports = model;
