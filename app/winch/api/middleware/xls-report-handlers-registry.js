const {
  HandlersRegistry,
} = require('../../../../api/lib/util/handler')


class XlsReportHandlersRegistry extends HandlersRegistry {
  constructor () {
    super('XlsReportHandlersRegistry');
  }
}


module.exports = new XlsReportHandlersRegistry();
