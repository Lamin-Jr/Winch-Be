const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
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
  last_update_ts: Date,
  last_updater_role: String,
  enabled: {
    type: Boolean,
    default: false
  },
  correlation_id: mongoose.Schema.Types.ObjectId,
  third_party_provider_info: {
    type: Object,
    properties: {
      type: {
        type: String,
        data: Object
      }
    }
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  nickname: String,
  secret: {
    type: String,
    required: true
  },
  registration_email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  contact_email: {
    type: String,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  }
});

module.exports = mongoose.model('Account', accountSchema);
