exports.boot = () => {
  let handlerSlug;
  let HandlerClass;

  //
  // report recipe
  handlerSlug = 'report-recipe';
  const reportRecipeHandlersRegistry = require(`../app/winch/api/middleware/${handlerSlug}-handlers-registry`);
  HandlerClass = require(`../app/winch/api/middleware/${handlerSlug}-handler/e-sold-base`);
  reportRecipeHandlersRegistry.boot('e-sold-base', new HandlerClass());

  //
  // pdf report
  handlerSlug = 'pdf-report';
  const pdfReportHandlersRegistry = require(`../app/winch/api/middleware/${handlerSlug}-handlers-registry`);
  HandlerClass = require(`../app/winch/api/middleware/${handlerSlug}-handler/e-sold-base`);
  pdfReportHandlersRegistry.boot('e-sold-base', new HandlerClass());
};
