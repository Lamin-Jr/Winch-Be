const { 
  TemplateEngine, 
} = require('../template');


class JsTemplateEngine extends TemplateEngine {
  constructor() {
    super();
  }

  render(body, renderContext, engineContext = undefined) {
    return JSON.parse(JSON.stringify(body, (key, val) => {
      if (typeof val === 'string' && val.match(/^\${(.+)}$/)) {
        return renderContext[val.replace(/[(\${)|}]/g, '')]
      }
      return val;
    }));
  }
}


module.exports = JsTemplateEngine;