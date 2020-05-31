class Handler {
  handle(context) {
    return new Promise(resolve => resolve({
      context
    }));
  }
}

class HandlersRegistry {
  constructor(tag = 'HandlersRegistry') {
    this._tag = tag;
    this._registry = {};
  }

  boot(key, handler) {
    this._registry[key] = handler;
  }

  handle(key, context) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this._registry[key].handle(context));
      } catch (error) {
        console.error(`[${this._tag}] failure on handling '${key}'`)
        console.error(error)
        reject(error);
      }
    });
  }
}


module.exports = {
  Handler,
  HandlersRegistry,
}
