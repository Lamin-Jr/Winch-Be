class DmsEngine {
  copy (actionContext, engineContext) {
    return new Promise((resolve, reject) => reject('dms://copy not supported'))
  }

  load (actionContext, engineContext) {
    return new Promise((resolve, reject) => reject('dms://load not supported'))
  }

  store (actionContext, engineContext) {
    return new Promise((resolve, reject) => reject('dms://store not supported'))
  }

  test (actionContext, engineContext) {
    return new Promise((resolve, reject) => reject('dms://test not supported'))
  }
}

class DmsRegistry {
  constructor () {
    this._registry = {};
  }

  boot (key, engine) {
    this._registry[key] = engine;
  }

  get (key) {
    return this._registry[key];
  }

  copyDocumentWith (key, actionContext = undefined, engineContext = undefined) {
    return this.get(key).copy(actionContext, engineContext);
  }

  loadDocumentWith (key, actionContext = undefined, engineContext = undefined) {
    return this.get(key).load(actionContext, engineContext);
  }

  storeDocumentWith (key, actionContext = undefined, engineContext = undefined) {
    return this.get(key).store(actionContext, engineContext);
  }

  testDocumentWith (key, actionContext = undefined, engineContext = undefined) {
    return this.get(key).test(actionContext, engineContext);
  }
}


module.exports = {
  DmsEngine,
  DmsRegistry,
}
