const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const representativeSchema = mongoose.Schema({
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
  plants: {
    type: Array,
    items: {
      type: String,
    },
    required: true
  }
}, { 
  collection: 'representatives'
});

representativeSchema.index({
  plant: 1
}, {
  name: 'plant-asc',
  background: true
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Representative', representativeSchema);


module.exports = model;
