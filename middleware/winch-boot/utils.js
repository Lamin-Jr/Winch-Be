"use strict"


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
  }

  apply (target) {
    const prefixKey = `|${target.project.id}|${target.project.code}|`

    let lastIndex = this._mapping.get(prefixKey);
    if (lastIndex === undefined) {
      lastIndex = 0
    }
    lastIndex++;
    this._mapping.set(prefixKey, lastIndex);

    target._id = `${prefixKey}${lastIndex}|`
  }
}


module.exports = {
  buildFeaturesCollection,
  PlantIdGenerator
}
