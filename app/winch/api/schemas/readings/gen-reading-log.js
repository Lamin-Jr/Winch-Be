const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const genReadingLogSchema = mongoose.Schema({
  _id: String,
  ts: {
    type: Date,
    required: true
  },
  s: {
    i: {
      type: Double,
      default: undefined
    },
    t: {
      in: {
        type: Double,
        default: undefined
      },
      out: {
        type: Double,
        default: undefined
      },
      mod: {
        type: Double,
        default: undefined
      }
    }
  },
  e: {
    i: {
      type: Double,
      default: undefined
    },
    s: {
      type: Double,
      default: undefined
    },
    b: {
      type: Double,
      default: undefined
    },
    d: {
      type: Double,
      default: undefined
    }
  },
  b: {
    soc: {
      type: Double,
      default: undefined
    },
    i: {
      type: Double,
      default: undefined
    },
    v: {
      type: Double,
      default: undefined
    },
    t: {
      type: Double,
      default: undefined
    }
  },
  misc: {
    'ac': {
      type: Double,
      default: undefined
    },
    'fan': {
      type: Array,
      items: {
        type: Double
      },
      default: undefined
    }
  }
}, { 
  collection: 'device-readings',
});


module.exports = genReadingLogSchema;
