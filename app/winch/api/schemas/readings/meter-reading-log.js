const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const meterReadingLogSchema = mongoose.Schema({
  _id: String,
  m: {
    type: String,
    required: true
  },
  c: {
    type: String,
    required: true
  },
  ct: String,
  ts: {
    type: Date,
    required: true
  },
  s: {
    type: String,
    required: true
  },
  fq: {
    type: Double,
    default: undefined
  },
  v: {
    'min': {
      type: Double,
      default: undefined
    },
    'avg': {
      type: Double,
      required: true
    },
    'max': {
      type: Double,
      default: undefined
    }
  },
  i: {
    'min': {
      type: Double,
      default: undefined
    },
    'avg': {
      type: Double,
      required: true
    },
    'max': {
      type: Double,
      required: true
    }
  },
  p: {
    fct: {
      type: Double,
      default: undefined
    },
    trms: {
      type: Double,
      required: true
    },
    va: {
      type: Double,
      default: undefined
    },
    e: {
      type: Double,
      required: true
    }
  },
  ac: {
    c: {
      type: Double,
      default: undefined
    },
    d: {
      type: Double,
      default: undefined
    },
    tx: {
      type: Double,
      default: undefined
    },
    sg: {
      type: Double,
      default: undefined
    },
    r: {
      type: Double,
      default: undefined
    },
    t: {
      type: String,
      default: undefined
    },
    ta: {
      type: Double,
      default: undefined
    },
    l: {
      p: {
        max: {
          type: Double,
          default: undefined
        }
      },
      e: {
        day: {
          type: Double,
          default: undefined
        }
      }
    },
    ad: {
      p: mongoose.Schema.Types.ObjectId,
      ph: {
        type: Number,
        min: 1,
        max: 3
      }
    }
  }
}, { 
  collection: 'meter-readings'
});


module.exports = meterReadingLogSchema;