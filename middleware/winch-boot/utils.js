"use strict"

// private part
//
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


// public part
//
function buildFeaturesCollection(lat, lng) {
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
  constructor() {
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
  }

  apply (target) {
    if (target.project.id === 'WP1' && target.project.code === 'SLL_2019_001') {
      applyWP1Sl(this._wp1Mapping, target);
    } else {
      applyDefault(this._mapping, target);
    }
  }
}


module.exports = {
  buildFeaturesCollection,
  PlantIdGenerator
}
