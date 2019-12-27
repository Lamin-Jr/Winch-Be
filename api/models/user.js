const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  creator: {
    type: String,
    required: true
  },
  creator_ts: {
    type: Date,
    required: true
  },
  creator_role: {
    type: String,
    required: true
  },
  last_update_by: String,
  last_update_ts: String,
  last_updater_role: String,
  enabled: Boolean,
  applicationName: {
    type: String,
    required: true
  },
  applicationName: {
    type: String,
    required: true
  },
  accountUsername: {
    type: String,
    required: true
  },
  resourceOwner: {
    type: Object,
    properties: {
      enabled: Boolean,
      roleName: String,
      profiles: {
        type: Array,
        items: {
          type: String
        }
      },
      tokenDuration: {
        type: Object,
        properties: {
          type: {
            value: Number,
            unit: String
          }
        }
      }
    }
  }
});

module.exports = mongoose.model('User', userSchema);
