const {
  TemplateEngine,
} = require('../template');

const defaultsEngineContext = {
  openDelimiter: '${',
  closeDelimiter: '}',
}

class JsTemplateEngine extends TemplateEngine {
  constructor () {
    super();
  }

  render (body, renderContext, engineContext = defaultsEngineContext) {
    const placeholderBegin = engineContext.openDelimiter;
    const placeholderEnd = engineContext.closeDelimiter;
    return JSON.parse(JSON.stringify(body, (key, val) => {
      if (typeof val === 'string' && val.startsWith(placeholderBegin) && val.endsWith(placeholderEnd)) {
        return renderContext[val.slice(placeholderBegin.length, -placeholderEnd.length)];
      }
      return val;
    }));
  }
}


module.exports = JsTemplateEngine;