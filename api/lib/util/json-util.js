"use strict"

class JsonObjectTypes {
  static isRealValue(json) {
    return json !== 'null' && json !== 'undefined'
  }

  static isObjectUnsafe(target) {
    return typeof target == 'object'
  }

  static isObject(target) {
    return target && this.isRealValue(target) && this.isObjectUnsafe(target)
  }

  static isArrayUnsafe(target) {
    return Array.isArray(target)
  }

  static isArray(target) {
    return target && this.isRealValue(target) && this.isArrayUnsafe(target)
  }

  static isEmptyArray(target) {
    return this.isArray(target) && target.length == 0
  }

  static isPositiveInteger(target) {
    // it works if we consider a JavaScript integer to be a value of maximum 4294967295
    return target >>> 0 === parseFloat(target)
  }
}

class JsonObjectHelper {
  static isEmpty(target) {
    return JsonObjectHelper._checkEmptyness(target, true)
  }

  static isNotEmpty(target) {
    return JsonObjectHelper._checkEmptyness(target, false)
  }

  static encode(json) {
    return Buffer.from(JSON.stringify(json)).toString('base64')
  }

  static decode(base64JsonString) {
    return JSON.parse(Buffer.from(base64JsonString, 'base64').toString())
  }

  static jsonizeError(e) {
    var result = {}
    Object.getOwnPropertyNames(e).forEach((key) => {
      result[key] = e[key]
    })
    return result
  }

  static buildFlattenJson(structuredJson) {
    const flattenJson = {}

    JsonObjectFlatter.crawlKeys(flattenJson, structuredJson)

    return flattenJson
  }

  static _checkEmptyness(target, logic) {
    for (var x in target) {
      return !logic
    }
    return logic
  }

}

//
// PRIVATE section
//

class JsonObjectFlatter {
  static crawlKeys(flattenJson, structuredJson, currentPath = '', pathSep = '.') {

    for (const [key, value] of Object.entries(structuredJson)) {
      const nextPath = currentPath + pathSep + key
      // console.log('checking ' + nextPath)
      if (!JsonObjectTypes.isRealValue(value)) {
        // console.log('  -> skip as invalid value')
        continue
      }

      if (JsonObjectTypes.isObjectUnsafe(value)) {
        // console.log('  {} ' + nextPath + ' => ' + value)
        this.crawlKeys(flattenJson, value, nextPath)
      } else {
        // console.log('  -> insert ' + nextPath + ' => ' + value)
        flattenJson[nextPath.substring(1)] = value
      }
    }

  }
}


module.exports = {
  JsonObjectTypes,
  JsonObjectHelper
}
