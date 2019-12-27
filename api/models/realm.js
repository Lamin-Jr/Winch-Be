const mongoose = require('mongoose');

const mongooseMixins = require('../middleware/mongoose-mixins')

const realmSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ...mongooseMixins.fullCrudActors,
  enabled: {
    type: Boolean,
    default: false
  },
  'correlation-id': {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  'app-name': {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true
  },
  groups: [mongoose.Schema.Types.ObjectId]
}, { 
  collection: 'realms',
  ...mongooseMixins.fullCrudActorsTs
});

module.exports = mongoose.model('Realm', realmSchema);
