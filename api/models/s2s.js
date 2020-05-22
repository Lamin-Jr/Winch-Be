const mongoose = require('mongoose');

const s2sSchema = mongoose.Schema({
  _id: String,
  'expires-at': Date,
  'app-names': {
    type: Array,
    items: {
      type: String
    },
    default: undefined,
  }
}, {
  collection: 's2s',
  strict: false,
  versionKey: false,
});

s2sSchema.index({
  'expires-at': 1
}, {
  name: 'ttl',
  expireAfterSeconds: 0
});


module.exports = mongoose.model('S2S', s2sSchema);
