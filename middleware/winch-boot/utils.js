"use strict"


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
  PlantIdGenerator,
}
