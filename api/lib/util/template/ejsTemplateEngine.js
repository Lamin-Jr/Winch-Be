const { 
  TemplateEngine, 
} = require('../template');


class EjsTemplateEngine extends TemplateEngine {
  constructor() {
    super();
  }

  render(body, renderContext, engineContext = undefined) {
    return require('ejs').render(body, renderContext);
  }
}


module.exports = EjsTemplateEngine;