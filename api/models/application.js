const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  secret: {
    type: String,
    required: true
  },
  description: String,
  clientCredentials: {
    type: Object,
    properties: {
      enabled: Boolean,
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

module.exports = mongoose.model('Application', applicationSchema);
