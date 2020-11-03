const { 
  TemplateEngine, 
} = require('../template');


class EjsTemplateEngine extends TemplateEngine {
  constructor() {
    super();
  }

  render(body, renderContext, engineContext) {
    return require('ejs').render(body, renderContext, engineContext);
  }
}


module.exports = EjsTemplateEngine;