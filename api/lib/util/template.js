class TemplateEngine {
  render(body, context) {
    return '';
  }
}

class TemplateEnginesRegistry {
  constructor() {
    this._registry = {};
  }

  boot(key, engine) {
    this._registry[key] = engine;
  }

  renderWith(key, body, renderContext, engineContext = undefined) {
    return this._registry[key].render(body, renderContext, engineContext);
  }
}


module.exports = {
  TemplateEngine,
  TemplateEnginesRegistry,
}
