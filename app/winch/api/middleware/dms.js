const { DmsRegistry } = require("../../../../api/lib/util/dms");

class Dms {
  constructor () {
    this._enginesRegistry = new DmsRegistry();
    this._context = {};
  }

  bootInstance (dmsEngineKey, dmsEngineInstance, dmsEngineContext = {}) {
    this._enginesRegistry.boot(dmsEngineKey, dmsEngineInstance);
    this._context[dmsEngineKey] = dmsEngineContext;
  }

  getInstance (dmsEngineKey) {
    return {
      engine: this._enginesRegistry.get(dmsEngineKey),
      context: this._context[dmsEngineKey],
    };
  }
}

module.exports = new Dms();
