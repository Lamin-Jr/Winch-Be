const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const plantSchema = mongoose.Schema({
  _id: String,
  ...mongooseMixins.fullCrudActors,
  enabled: Boolean,
  name: {
    type: String,
    required: true
  },
  project: {
    id: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    desc: {
      type: String,
      required: true
    }
  },
  geo: {
    type: mongoose.Schema.Types.FeatureCollection,
    required: true
  },
  village: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  dates: {
    'commit': Date,
    'business': Date,
  },
  setup: {
    pv: {
      cpty: {
        type: Double,
        required: true
      }
    },
    batt: {
      cpty: {
        type: Double,
        required: true
      }
    },
    genset: {
      cpty: {
        type: Double,
        required: true
      }
    }
  },
  tariffs: {
    type: Array,
    items: {
      type: mongoose.Schema.Types.ObjectId
    },
  },
  'add-ons': {
    type: Array,
    items: {
      type: mongoose.Schema.Types.ObjectId
    },
  },
  stats: {
    'total-active-customers': {
      type: Number,
      default: 0  
    },
    'chc-count': {
      type: Number,
      default: 0  
    },
    'school-count': {
      type: Number,
      default: 0  
    },
    'total-waiting-customers': {
      type: Number,
      default: 0    
    }
  },
  organization: {
    office: {
      fullAddress: String
    },
    representatives: {
      type: Array,
      items: {
        type: mongoose.Schema.Types.ObjectId
      },
    },
    'om-managers': {
      type: Array,
      items: {
        type: mongoose.Schema.Types.ObjectId
      },
    },
    agents: {
      type: Array,
      items: {
        type: mongoose.Schema.Types.ObjectId
      },
    }
  }
}, { 
  collection: 'plants',
  ...mongooseMixins.fullCrudActorsTs,
});

plantSchema.index({
  name: 1
}, {
  name: 'name-unique-asc',
  unique: true,
  background: true
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Plant', plantSchema);


module.exports = model;
