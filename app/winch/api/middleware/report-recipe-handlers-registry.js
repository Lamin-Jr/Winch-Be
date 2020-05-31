const {
  HandlersRegistry,
} = require('../../../../api/lib/util/handler')


class ReportRecipeHandlersRegistry extends HandlersRegistry {
  constructor() {
    super('ReportRecipeHandlersRegistry');
  }
}


module.exports = new ReportRecipeHandlersRegistry();
