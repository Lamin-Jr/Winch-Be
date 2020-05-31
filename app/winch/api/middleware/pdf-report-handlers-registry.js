const {
  HandlersRegistry,
} = require('../../../../api/lib/util/handler')


class PdfReportHandlersRegistry extends HandlersRegistry {
  constructor() {
    super('PdfReportHandlersRegistry');
  }
}


module.exports = new PdfReportHandlersRegistry();
