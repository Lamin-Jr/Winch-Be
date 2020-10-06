const mongoose = require('mongoose');

const mongooseMixins = require('../../api/middleware/mongoose-mixins')


//
// private part

function applyDefault (mapping, target) {
  const prefixKey = `|${target.project.id}|${target.project.code}|`

  let lastIndex = mapping.get(prefixKey);
  if (lastIndex === undefined) {
    lastIndex = 0
  }
  lastIndex++;
  mapping.set(prefixKey, lastIndex);

  target._id = `${prefixKey}${lastIndex}|`
}

function applyWP1Sl (mapping, target) {
  target._id = `|${target.project.id}|${target.project.code}|${mapping[target.name]}|`
}

function applyBunjakoUg (mapping, target) {
  target._id = `|${target.project.id}|${target.project.code}|${mapping[target.name]}|`
}

function applyHubUg (target) {
  target._id = '|UG|HUB-SEN|1|'
}


//
// public part


function buildSystemCreator () {
  const creator = new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID);
  const creatorRole = process.env.WCH_AUTHZ_SYSTEM_ROLE;
  return mongooseMixins.makeCreator(creator, creatorRole);
}

function buildFeaturesCollection (lat, lng) {
  const result = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      }
    ]
  };
  return result;
}

class PlantIdGenerator {
  constructor () {
    this._mapping = new Map();
    this._wp1Mapping = {
      'Bafodia': 69,
      'Batkanu': 7,
      'Fintonia': 46,
      'Kagbere': 8,
      'Kamaranka': 27,
      'Kathantha Yimboi': 5,
      // TODO koinadugu
      'Mabang': 43,
      'Mara': 31,
      'Musaia': 65,
      'Rokonta': 42,
      'Sinkunia': 55,
      'Yiffin': 87,
    };
    this._bunjakoMapping = {
      'Ssenyondo': 1,
      'Bugoma': 2,
      'Bukina': 3,
    };
  }

  apply (target) {
    if (target.project.id === 'WP1' && target.project.code === 'SLL_2019_001') {
      applyWP1Sl(this._wp1Mapping, target);
    } else if (target.project.id === 'Bunjako' && target.project.code === 'UGA_2019_003') {
      applyBunjakoUg(this._bunjakoMapping, target);
    } else if (target.project.id === '-' && target.project.code === '-' && target.setup.genset.cpty > 0.0) {
      applyHubUg(target);
    } else {
      applyDefault(this._mapping, target);
    }
  }
}


module.exports = {
  buildSystemCreator,
  buildFeaturesCollection,
  PlantIdGenerator
}
